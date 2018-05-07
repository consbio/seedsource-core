import React from 'react'
import PropTypes from 'prop-types'

const SavedRun = ({ active, save, onClick, onLoad, onDelete }) => {
    let className = 'configuration-item'
    let { modified, title } = save

    if (active) {
        className += ' focused'
    }

    return (
        <div
            className={className}
            onClick={() => {
                onClick()
            }}
        >
            <div className="is-pulled-right buttons">
                <button
                    onClick={() => {
                        if (confirm('Load this saved configuration? This will replace your current settings.')) {
                            onLoad(save)
                        }
                    }}
                    className="button is-primary"
                >
                    <span className="icon-load-12" aria-hidden="true"></span> Load
                </button>
                <button
                    onClick={() => {
                        if (confirm('Delete this saved configuration?')) {
                            onDelete(save.uuid)
                        }
                    }}
                    className="button is-danger"
                >
                    <span className="icon-trash-12" aria-hidden="true"></span> Delete
                </button>
            </div>
            <div className="save-title">{title}</div>
            <div className="save-date">
                Last modified: {modified.getMonth()+1}/{modified.getDate()}/{modified.getYear()}
            </div>
            <div className="clear-fix"></div>
        </div>
    )
}

SavedRun.propTypes = {
    active: PropTypes.bool.isRequired,
    save: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
}

export default SavedRun
