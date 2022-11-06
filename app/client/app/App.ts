import './common.scss';
import PageBuilder from './common/PageBuilder';
import Lobby from './lobby/Lobby';

export default class App {
    static start() {
        const app = PageBuilder.createElement('div', { id: 'app' });
        document.body.append(app);
        Lobby.init();
    }
}
