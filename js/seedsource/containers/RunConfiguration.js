import { connect } from 'react-redux'
import RunConfiguration from 'seedsource/components/RunConfiguration'

const mapStateToProps = state => {
    let { activeStep, runConfiguration, lastRun, job, pdfIsFetching } = state

    return {
        state,
        job,
        activeStep
    }
}

export default connect(mapStateToProps)(RunConfiguration)
