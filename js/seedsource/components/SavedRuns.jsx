import React from 'react'
import PropTypes from 'prop-types'
import SavedRun from 'seedsource/containers/SavedRun'

class SavedRuns extends React.Component {
    constructor(props) {
        super(props)
        this.state = {activeSave: null}
    }

    componentDidMount() {
        this.props.onLoad()
    }

    componentWillUpdate({ isLoggedIn }) {
        if (this.props.isLoggedIn !== isLoggedIn) {
            this.props.onLoad()
        }
    }

    render() {
        let { saves, isLoggedIn } = this.props
        let { activeSave } = this.state

        if (!isLoggedIn) {
            return (
                <article className="message is-dark">
                    <div className="message-body">
                        You may create an account to save and retrieve your runs. Click on the "Account" tab in the
                        upper right to login or create an account..
                    </div>
                </article>
            )
        }

        if (saves.length == 0) {
            return <div>You currently have no saved runs.</div>
        }

        return (
            <div className="configuration-list">
                {saves.map(item => {
                    return (
                        <SavedRun
                            key={item.uuid}
                            save={item}
                            active={activeSave === item.uuid}
                            onClick={() => {
                                this.setState({activeSave: item.uuid})
                            }}
                        />
                    )
                })}
            </div>
        )
    }
}

SavedRuns.propTypes = {
    saves: PropTypes.array.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired
}

export default SavedRuns
