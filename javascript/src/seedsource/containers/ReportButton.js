import { connect } from 'react-redux'
import GroupedButton from 'seedsource/components/GroupedButton'
import { createReport } from "../../actions/report";
import PropTypes from 'prop-types'

const mapStateToProps = (state, { name }) => {
    return {
        active: name === state.runConfiguration.unit
    }
}

const mapDispatchToProps = (dispatch, { name }) => {
    return {
        onClick: () => {
            dispatch(createReport(name))
        }
    }
}

GroupedButton.propTypes = {
    name: PropTypes.string.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupedButton)
