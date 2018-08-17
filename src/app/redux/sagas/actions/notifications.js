import { call, put, all, select } from 'redux-saga/effects';
import constants from 'app/redux/constants';
import GlobalReducer from 'app/redux//GlobalReducer';
import { api } from 'golos-js';

export function* hydrateNotifications(notifications) {
    const hydrateUsers = [];
    const hydrateContents = [];

    for (let notification of notifications) {
        const { fromUsers } = notification;

        const author = fromUsers[0];

        for (let user of fromUsers) {
            let account = yield select(state => state.global.get('accounts').get(user));
            if (!account) hydrateUsers.push(user);
        }

        if (['vote', 'flag', 'repost', 'reply', 'mention', 'award', 'curatorAward'].includes(notification.eventType)) {
            const { permlink } = notification;
            let content = yield select(state =>
                state.global.getIn(['content', `${author}/${permlink}`])
            );
            if (!content) {
                hydrateContents.push(
                    call(
                        [api, api.getContentAsync],
                        author,
                        permlink,
                        constants.DEFAULT_VOTE_LIMIT
                    )
                );
            }
        }
    }

    if (hydrateContents.length) {
        const contents = yield all(hydrateContents);
        yield put(GlobalReducer.actions.receiveContents({ contents }));
    }

    if (hydrateUsers.length) {
        const accounts = yield call([api, api.getAccountsAsync], hydrateUsers);
        yield put(GlobalReducer.actions.receiveAccounts({ accounts }));
    }

    return notifications;
}