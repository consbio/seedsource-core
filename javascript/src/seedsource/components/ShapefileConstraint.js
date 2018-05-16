import React from 'react'
import ShapefileUpload from 'seedsource/containers/ShapefileUpload'
import PropTypes from 'prop-types'


const ShapefileConstraint = ({index, onRemove}) => {
    return (
        <tr className="constraint">
            <td>
                <a
                    className="delete"
                    onClick={e => {
                        e.stopPropagation()
                        onRemove(index)
                    }}
                ></a>
            </td>
            <td><strong>Shapefile</strong></td>
            <td colSpan="2">
                <ShapefileUpload index={index}/>
            </td>
        </tr>
    )
}

ShapefileConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired
}

export default ShapefileConstraint
