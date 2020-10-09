import React from 'react'

export default ({userSites, removeSite, setActiveSite}) => {
  if (!userSites.length) {
    return null
  }

  return (
    <table className="table" style={{lineHeight: '20px'}} onMouseOut={() => {
      setActiveSite(null)
    }}>
      <tbody>
      {userSites.map(({lat, lon}, index) => (
        <tr key={`${lat}-${lon}`} onMouseOver={() => {
          setActiveSite(index)
        }}>
          <td className="is-narrow"><button type="button" className="delete" onClick={() => removeSite(index)} /></td>
          <td><strong>{lat}, {lon}</strong></td>
        </tr>
      ))}
      </tbody>
    </table>
  )
}
