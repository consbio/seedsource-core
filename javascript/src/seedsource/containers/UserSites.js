import { connect } from 'react-redux'
import { removeUserSite, setActiveUserSite } from '../../actions/point'
import UserSites from 'seedsource/components/UserSites'

export default connect(({runConfiguration}) => {
  const { userSites } = runConfiguration
  return {userSites: userSites.map(({lat, lon}) => ({
      lat: lat.toFixed(2),
      lon: lon.toFixed(2)
  }))}
}, dispatch => ({
  removeSite: index => dispatch(removeUserSite(index)),
  setActiveSite: index => dispatch(setActiveUserSite(index))
}))(UserSites)
