import { connect } from 'react-redux'
import config from 'seedsource/config'
import { removeTrait, setTraitTransfer } from '../../actions/traits'
import Trait from 'seedsource/components/Trait'

const mapStateToProps = (_, { trait }) => {
    let traitConfig = config.functions.find(item => item.name === trait.name)
    return { trait, traitConfig }
}

const mapDispatchToProps = (dispatch, { index }) => {
    return {
        onRemove: () => dispatch(removeTrait(index)),
        onTransferChange: transfer => dispatch(setTraitTransfer(index, parseFloat(transfer)))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Trait)
