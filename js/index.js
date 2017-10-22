import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers'
import App from 'seedsource/components/App'
import variables from './async/variables'
import zones from './async/zones'
import legends from './async/legends'
import point from './async/point'
import popup from './async/popup'


const store = createStore(reducers, applyMiddleware(thunkMiddleware))

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('SeedsourceApp')
)

// Register resync handlers
variables(store)
zones(store)
legends(store)
point(store)
popup(store)
