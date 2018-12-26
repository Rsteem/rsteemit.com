import { fork, take, call, put, cancel, select, actionChannel } from 'redux-saga/effects';
import { eventChannel, buffers } from 'redux-saga';
import golos from 'golos-js';
import { normalize as normalizr } from 'normalizr';

import { getGateSocket } from 'src/app/helpers/gate';
import { makeFakeAuthTransaction } from './utils';
import { addNotificationOnline } from 'src/app/redux/actions/notificationsOnline';
import { showNotification } from 'src/app/redux/actions/ui';
import { getSettingsOptions } from 'src/app/redux/actions/settings';

import {
    GATE_SEND_MESSAGE,
    GATE_CONNECT,
    GATE_CONNECT_SUCCESS,
    GATE_AUTHORIZED,
    GATE_DISCONNECT,
} from 'src/app/redux/constants/gate';

export default function* rootSaga() {
    yield fork(flow);
}

function* flow() {
    // Channel listen messages for writing
    const writeChannel = yield actionChannel(GATE_SEND_MESSAGE, buffers.expanding(10));

    while (true) {
        // Wait for user login
        yield take(`user/SET_USER`);

        yield put({ type: GATE_CONNECT });

        const socket = yield call(getGateSocket);

        yield put({ type: GATE_CONNECT_SUCCESS });

        const task = yield fork(handleIO, socket, writeChannel);

        // Wait for user logout
        yield take(`user/LOGOUT`);

        yield cancel(task);
    }
}

function* handleIO(socket, writeChannel) {
    yield fork(write, socket, writeChannel);
    yield fork(read, socket);
}

function* read(socket) {
    const channel = yield call(subscribe, socket);
    while (true) {
        const action = yield take(channel);
        yield put(action);
    }
}

function* write(socket, writeChannel) {
    // Wait for authorization on gate
    yield take(GATE_AUTHORIZED);

    while (true) {
        // TODO: need to cancel same request.?
        const action = yield take(writeChannel);
        const { types, method, data, normalize, successCallback, errorCallback } = action.payload;

        const [requestType, successType, failureType] = types || [];

        const actionWith = data => ({ ...action, ...data });

        if (requestType) {
            yield put(actionWith({ type: requestType }));
        }

        try {
            const result = yield call([socket, 'call'], method, data);
            let normalizedPayload = {};

            if (normalize) {
                const { transform, saga, schema } = normalize;
                // if we need to get result from unusual property
                if (transform) {
                    normalizedPayload = transform(result);
                }
                // if exists saga for hydrate data from blockchain
                if (saga) {
                    normalizedPayload = yield call(saga, normalizedPayload);
                }
                if (schema) {
                    normalizedPayload = normalizr(normalizedPayload, schema);
                }
            }

            const payload = { ...result, ...normalizedPayload };

            if (successType) {
                yield put(actionWith({ type: successType, payload }));
            }

            if (successCallback) {
                try {
                    successCallback(payload);
                } catch (error) {
                    console.error(error);
                }
            }
        } catch (err) {
            console.error('Gate error:', err);

            yield put(showNotification(err.message));

            if (failureType) {
                yield put(actionWith({ type: failureType, error: err.message }));
            }

            if (errorCallback) {
                errorCallback(err.message);
            }
        }
    }
}

function* subscribe(socket) {
    const current = yield select(state => state.user.get('current'));
    const postingPrivateKey = current.getIn(['private_keys', 'posting_private']);
    const userName = current.get('username');

    return eventChannel(emit => {
        socket.on('sign', ({ secret }) => {
            const transaction = makeFakeAuthTransaction(userName, secret);
            const {
                signatures: [xsign],
            } = golos.auth.signTransaction(transaction, [postingPrivateKey]);

            socket
                .call('auth', {
                    user: userName,
                    sign: xsign,
                })
                .then(() => {
                    emit({ type: GATE_AUTHORIZED });

                    // load settings after authorization
                    emit(getSettingsOptions());

                    socket.call('onlineNotifyOn', {});
                });
        });

        socket.on('onlineNotify', ({ result }) => emit(addNotificationOnline(result)));

        return () => emit({ type: GATE_DISCONNECT });
    });
}
