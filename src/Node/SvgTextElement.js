import React from 'react';
import uuid from 'uuid';
import PropTypes from 'prop-types';

export default class SvgTextElement extends React.PureComponent {
  render() {
    const { name, nodeStyle, textLayout, attributes, nodeSvgShape: { shapeProps: { r, x, y, centerRectText}} } = this.props;
    let textX = textLayout.x + 4*r/5;
    let textY = textLayout.y;
    if(centerRectText){
      textX = r ? textLayout.x + 4*r/5 : (x ? x-(x/4) : textLayout.x);
      textY = y ? -1 * y/4 : textLayout.y;
    }
    return (
      <g>
        <text
          className="nodeNameBase"
          style={nodeStyle.name}
          textAnchor={textLayout.textAnchor}
          x={textX}
          y={textY}
          transform={textLayout.transform}
          dy=".35em"
        >
          {name}
        </text>
        <text
          className="nodeAttributesBase"
          y={textLayout.y + 10}
          textAnchor={textLayout.textAnchor}
          transform={textLayout.transform}
          style={nodeStyle.attributes}
        >
          {attributes &&
            Object.keys(attributes).map(labelKey => (
              <tspan x={textLayout.x} dy="1.2em" key={uuid.v4()}>
                {labelKey}: {attributes[labelKey]}
              </tspan>
            ))}
        </text>
      </g>
    );
  }
}

SvgTextElement.defaultProps = {
  attributes: undefined,
};

SvgTextElement.propTypes = {
  name: PropTypes.string.isRequired,
  attributes: PropTypes.object,
  textLayout: PropTypes.object.isRequired,
  nodeStyle: PropTypes.object.isRequired,
};
