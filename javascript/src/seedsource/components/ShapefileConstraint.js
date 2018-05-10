import React from 'react'
import Constraint from 'seedsource/containers/Constraint'
import EditableLabel from 'seedsource/components/EditableLabel'
import Upload from 'seedsource/containers/Upload'


//TODO: add onchange type function to input
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
            <td>
                <Upload index={index}/>
            </td>
        </tr>
    )
}

export default ShapefileConstraint
