import React from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3';

import './style.css';
import SvgTextElement from './SvgTextElement';
import ForeignObjectElement from './ForeignObjectElement';

export default class Node extends React.Component {
  isTransforming = false;

  constructor(props) {
    super(props);
    const { nodeData: { parent }, orientation } = props;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;

    this.state = {
      transform: this.setTransformOrientation(originX, originY, orientation),
      initialStyle: {
        opacity: 0,
      },
      onMouseOver: false,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleOnMouseOver = this.handleOnMouseOver.bind(this);
    this.handleOnMouseOut = this.handleOnMouseOut.bind(this);
  }

  componentDidMount() {
    const { nodeData: { x, y }, orientation, transitionDuration } = this.props;
    const transform = this.setTransformOrientation(x, y, orientation);
    this.applyTransform(false, transform, transitionDuration);
  }

  componentWillUpdate(nextProps) {
    const transform = this.setTransformOrientation(
      nextProps.nodeData.x,
      nextProps.nodeData.y,
      nextProps.orientation,
    );
    this.applyTransform(false, transform, nextProps.transitionDuration);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.shouldNodeTransform(this.props, nextProps, this.state, nextState);
  }

  shouldNodeTransform(ownProps, nextProps) {
    let updateForOnMouseOverItem = false;
    if (
      !this.isTransforming &&
      nextProps.nodeData.parent &&
      !nextProps.nodeData.parent._collapsed
    ) {
      updateForOnMouseOverItem = true;
    }
    return (
      updateForOnMouseOverItem ||
      nextProps.subscriptions !== ownProps.subscriptions ||
      nextProps.nodeData.x !== ownProps.nodeData.x ||
      nextProps.nodeData.y !== ownProps.nodeData.y ||
      nextProps.orientation !== ownProps.orientation
    );
  }

  setTransformOrientation(x, y, orientation) {
    return orientation === 'horizontal' ? `translate(${y},${x})` : `translate(${x},${y})`;
  }

  applyTransform(
    componentWillLeave,
    transform,
    transitionDuration,
    opacity = 1,
    done = () => {
      this.isTransforming = false;
    },
  ) {
    if (transitionDuration === 0) {
      select(this.node)
        .attr('transform', transform)
        .style('opacity', opacity);
    } else {
      if (componentWillLeave) {
        this.isTransforming = true;
      }
      select(this.node)
        .transition()
        .duration(transitionDuration)
        .attr('transform', transform)
        .style('opacity', opacity)
        .each('end', done);
    }
  }

  renderNodeElement(nodeStyle) {
    const { circleRadius, nodeSvgShape, onMouseOverItem, nodeData } = this.props;
    const { onMouseOver } = this.state;
    /* TODO: DEPRECATE <circle /> */
    if (circleRadius) {
      return <circle r={circleRadius} style={nodeStyle.circle} />;
    }
    const node = React.createElement(nodeSvgShape.shape, {
      ...nodeStyle.circle,
      ...nodeSvgShape.shapeProps,
      onMouseOver: () => this.handleOnMouseOver(),
      onMouseOut: () => this.handleOnMouseOut(),
      className: nodeData._children ? 'nodeBase' : 'leafNodeBase',
    });

    return nodeSvgShape.shape === 'none' ? null : (
      <g textAnchor="left">
        {node}
        {onMouseOver ? onMouseOverItem : null}
      </g>
    );
  }

  handleClick(evt) {
    this.props.onClick(this.props.nodeData.id, evt);
  }

  handleOnMouseOver(evt) {
    this.setState({ onMouseOver: true });
    this.props.onMouseOver(this.props.nodeData.id, evt);
  }

  handleOnMouseOut(evt) {
    this.setState({ onMouseOver: false });
    this.props.onMouseOut(this.props.nodeData.id, evt);
  }

  componentWillLeave(done) {
    const { nodeData: { parent }, orientation, transitionDuration } = this.props;
    const originX = parent ? parent.x : 0;
    const originY = parent ? parent.y : 0;
    const transform = this.setTransformOrientation(originX, originY, orientation);
    this.applyTransform(true, transform, transitionDuration, 0, done);
  }

  render() {
    const { nodeData, nodeSize, nodeLabelComponent, allowForeignObjects, styles } = this.props;
    const nodeStyle = nodeData._children ? { ...styles.node } : { ...styles.leafNode };
    return (
      <g
        id={nodeData.id}
        ref={n => {
          this.node = n;
        }}
        style={this.state.initialStyle}
        transform={this.state.transform}
        onClick={this.handleClick}
        onMouseOut={this.handleOnMouseOut}
      >
        {this.renderNodeElement(nodeStyle)}
        {allowForeignObjects && nodeLabelComponent ? (
          <ForeignObjectElement nodeData={nodeData} nodeSize={nodeSize} {...nodeLabelComponent} />
        ) : (
          <SvgTextElement {...this.props} nodeStyle={nodeStyle} />
        )}
      </g>
    );
  }
}

Node.defaultProps = {
  nodeLabelComponent: null,
  attributes: undefined,
  circleRadius: undefined,
  onMouseOverItem: undefined,
  styles: {
    node: {
      circle: {},
      name: {},
      attributes: {},
    },
    leafNode: {
      circle: {},
      name: {},
      attributes: {},
    },
  },
};

Node.propTypes = {
  nodeData: PropTypes.object.isRequired,
  nodeSvgShape: PropTypes.object.isRequired,
  nodeLabelComponent: PropTypes.object,
  nodeSize: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
  transitionDuration: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  onMouseOver: PropTypes.func.isRequired,
  onMouseOverItem: PropTypes.object,
  onMouseOut: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  attributes: PropTypes.object,
  textLayout: PropTypes.object.isRequired,
  subscriptions: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  allowForeignObjects: PropTypes.bool.isRequired,
  circleRadius: PropTypes.number,
  styles: PropTypes.object,
};
