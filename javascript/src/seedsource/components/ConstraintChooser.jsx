import React from 'react'
import ConstraintChooserItem from 'seedsource/components/ConstraintChooserItem'
import config from 'seedsource/config'

let { constraints } = config

class ConstraintChooser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selections: [null]}
    }

    render() {
        let { selections } = this.state
        let selection = selections[selections.length-1]
        let constraint = selection === null ? null : constraints.objects[selection]
        let { onAdd } = this.props

        return <div>
            <ConstraintChooserItem
                constraints={constraints.categories}
                selections={selections}
                onSelect={selections => this.setState({selections})}
            />
            {constraint === null ? null : <React.Fragment>
                <div className="constraint-arrow"></div>
                <button
                    className="button is-fullwidth is-primary"
                    onClick={() => {
                        onAdd(selection)
                        this.setState({selections: [null]})
                    }}
                >+ Add {constraint.label} Constraint</button>
            </React.Fragment>}
        </div>
    }
}

export default ConstraintChooser
