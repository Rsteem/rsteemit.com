import {WebEvent, esc} from 'db/models';
import Tarantool from 'db/tarantool';

export default function recordWebEvent(ctx, event_type, value) {
    if (ctx.state.isBot) return;
    const s = ctx.session;
    const r = ctx.req;
    let new_session = true;
    if (ctx.last_visit) {
        new_session = ((new Date()).getTime() / 1000 - ctx.last_visit) > 1800;
    }
    const remote_address = r.headers['x-forwarded-for'] || r.connection.remoteAddress;
    const ip_match = remote_address ? remote_address.match(/(\d+\.\d+\.\d+\.\d+)/) : null;
    const d = {
        event_type: esc(event_type, 1000),
        user_id: s.user,
        uid: s.uid,
        account_name: null,
        first_visit: ctx.first_visit,
        new_session,
        ip: ip_match ? ip_match[1] : null,
        value: value ? esc(value, 1000) : esc(r.originalUrl),
        refurl: esc(r.headers.referrer || r.headers.referer),
        user_agent: esc(r.headers['user-agent']),
        status: ctx.status,
        channel: esc(s.ch, 64),
        referrer: esc(s.r, 64),
        campaign: esc(s.cn, 64)
    };
    const start = process.hrtime();
    WebEvent.create(d, {logging: false}).then(res => {
      const elapsed = process.hrtime(start);
      console.log('WebEvent.create.time', + (elapsed[0] * 1e3 + elapsed[1] / 1e6).toFixed(1))
    }).catch(error => {
        console.error('!!! Can\'t create web event record', error);
    });
}

export function* recordUserEvent(ctx, account, type) {
    console.log(account, type)
    try {
        yield Tarantool.instance('tarantool').call('update_actions', account, type, new Date().getTime())
    } catch(err) {
        console.error('!!! Can\'t create user event record', err)
    }
}
