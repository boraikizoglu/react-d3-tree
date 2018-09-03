import React from 'react';
import PropTypes from 'prop-types';
import { svg, select } from 'd3';

import './style.css';

export default class Link extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      initialStyle: {
        opacity: 0,
      },
      onMouseOver: false,
    };
  }

  componentDidMount() {
    this.applyOpacity(1, this.props.transitionDuration);
  }

  componentWillLeave(done) {
    this.applyOpacity(0, this.props.transitionDuration, done);
  }

  applyOpacity(opacity, transitionDuration, done = () => {}) {
    if (transitionDuration === 0) {
      select(this.link).style('opacity', opacity);
      done();
    } else {
      select(this.link)
        .transition()
        .duration(transitionDuration)
        .style('opacity', opacity)
        .each('end', done);
    }
  }

  diagonalPath(linkData, orientation) {
    const diagonal = svg
      .diagonal()
      .projection(d => (orientation === 'horizontal' ? [d.y, d.x] : [d.x, d.y]));
    return diagonal(linkData);
  }

  straightPath(linkData, orientation) {
    const straight = svg
      .line()
      .interpolate('basis')
      .x(d => d.x)
      .y(d => d.y);

    let data = [
      { x: linkData.source.x, y: linkData.source.y },
      { x: linkData.target.x, y: linkData.target.y },
    ];

    if (orientation === 'horizontal') {
      data = [
        { x: linkData.source.y, y: linkData.source.x },
        { x: linkData.target.y, y: linkData.target.x },
      ];
    }

    return straight(data);
  }

  elbowPath(d, orientation) {
    return orientation === 'horizontal'
      ? `M${d.source.y},${d.source.x}V${d.target.x}H${d.target.y}`
      : `M${d.source.x},${d.source.y}V${d.target.y}H${d.target.x}`;
  }

  drawPath() {
    const { linkData, orientation, pathFunc } = this.props;

    if (typeof pathFunc === 'function') {
      return pathFunc(linkData, orientation);
    }

    if (pathFunc === 'elbow') {
      return this.elbowPath(linkData, orientation);
    }

    if (pathFunc === 'straight') {
      return this.straightPath(linkData, orientation);
    }

    return this.diagonalPath(linkData, orientation);
  }

  getOnMouseOverItemY() {
    const { linkData } = this.props;
    const currentY = linkData.target.y;
    const parentY = linkData.target.parent.y;
    return (currentY + parentY) / 2;
  }

  getOnMouseOverItemX() {
    const { linkData } = this.props;
    const currentX = linkData.target.x;
    const parentX = linkData.target.parent.x;
    return (currentX + parentX) / 2;
  }

  render() {
    const { styles, linkData } = this.props;
    const { onMouseOver } = this.state;
    const target = linkData.target.parentEdge;
    const { onMouseOverItem } = linkData.target.parentEdge;
    return (
      <g>
        {onMouseOver && onMouseOverItem
          ? React.cloneElement(onMouseOverItem, {
              x: this.getOnMouseOverItemX(),
              y: this.getOnMouseOverItemY(),
            })
          : null}
        {/* Visible path */}
        <path
          ref={l => {
            this.link = l;
          }}
          style={{ ...this.state.initialStyle, ...styles, ...target.style }}
          strokeDasharray={target.dashed ? '5,5' : null}
          className="linkBase"
          d={this.drawPath()}
          strokeWidth="2.5"
        />
        {/*
          a trick to make mouseOver easier(it is hard to click the edge since edge is really thin)
          see: https://stackoverflow.com/questions/18663958/clicking-a-svg-line-its-hard-to-hit-any-ideas-how-to-put-a-click-area-around-a-l
        */}
        {onMouseOverItem && (
          <path
            style={{ stroke: 'transparent', cursor: onMouseOverItem ? 'pointer' : null }}
            className="linkBase"
            d={this.drawPath()}
            strokeWidth="22"
            onMouseOver={() => this.setState({ onMouseOver: true })}
            onMouseLeave={() => this.setState({ onMouseOver: false })}
          />
        )}
      </g>
    );
  }
}

Link.defaultProps = {
  styles: {},
};

Link.propTypes = {
  linkData: PropTypes.object.isRequired,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
  pathFunc: PropTypes.oneOfType([
    PropTypes.oneOf(['diagonal', 'elbow', 'straight']),
    PropTypes.func,
  ]).isRequired,
  transitionDuration: PropTypes.number.isRequired,
  styles: PropTypes.object,
};
