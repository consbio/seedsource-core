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
        let { onAdd } = this.props

        return <div>
            <ConstraintChooserItem
                constraints={constraints.categories}
                selections={selections}
                onSelect={selections => {
                    let selection = selections[selections.length-1]
                    if (selection !== null) {
                        onAdd(selection)
                        this.setState({selections: [null]})
                    }
                    else {
                        return this.setState({selections})
                    }
                }}
            />
        </div>
    }
}

export default ConstraintChooser
