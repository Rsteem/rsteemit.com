import { combineEntitiesReducers } from 'redux-entities-immutable';
import notifications from './notifications';
import notificationsOnline from './notificationsOnline';

export default combineEntitiesReducers({
    notifications,
    notificationsOnline,
});
