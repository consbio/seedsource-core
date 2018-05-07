import { connect } from 'react-redux'
import SavedRuns from 'seedsource/components/SavedRuns'
import { fetchSaves } from '../../actions/saves'

const mapStateToProps = ({ saves, auth }) => {
    let { isLoggedIn } = auth

    return {saves: saves.saves, isLoggedIn}
}

const mapDispatchToProps = dispatch => {
    return {
        onLoad: () => {
            dispatch(fetchSaves())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SavedRuns)
