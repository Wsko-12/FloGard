import PageBuilder from '../common/PageBuilder';
import Game from '../game/Game';
import './lobby.scss';

export default class Lobby {
    static init() {
        const button = PageBuilder.createElement('button', { classes: ['lobby_button'], content: 'Start' });
        const container = PageBuilder.createElement('div', { classes: ['lobby_container'], content: [button] });

        button.addEventListener('click', () => {
            container.remove();
            Game.init();
        });

        document.getElementById('app')?.append(container);

        container.remove();
        Game.init();
    }
}
