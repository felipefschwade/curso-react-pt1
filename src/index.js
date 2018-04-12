import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import AutorBox from './components/Autores';
import Home from './components/Home';
import {Router,Route,browserHistory,IndexRoute} from 'react-router';
import LivrosBox from './components/Livros';

ReactDOM.render(
    (
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Home}/>
                <Route path="/autor" component={AutorBox}/>
                <Route path="/livro" component={LivrosBox}/>
            </Route>
        </Router>
    ),
    document.getElementById('root')
)
registerServiceWorker();
