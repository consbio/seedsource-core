import { connect } from 'react-redux'
import { selectTab } from '../../actions/tabs'
import Sidebar from 'seedsource/components/Sidebar'

const mapStateToProps = ({ activeTab }) => {
    return {activeTab}
}

const mapDispatchToProps = dispatch => {
    return {
        onSelect: tab => {
            dispatch(selectTab(tab))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
