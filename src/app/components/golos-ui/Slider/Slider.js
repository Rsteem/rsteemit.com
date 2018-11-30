import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';

import keyCodes from 'app/utils/keyCodes';

const Progress = styled.div`
    position: absolute;
    top: 10px;
    left: 0;
    width: ${({ width }) => width}%;
    height: 2px;
    border-radius: 1px;
    background: #2879ff;
`;

const HandleSlot = styled.div`
    position: relative;
    margin: 0 11px;
`;

const HandleWrapper = styled.div`
    position: absolute;
    left: ${({ left }) => left}%;

    padding: 5px;
    margin: -5px 0 0 -16px;
`;

const Handle = styled.div`
    width: 22px;
    height: 22px;

    line-height: 22px;
    font-size: 11px;
    font-weight: bold;
    text-align: center;
    color: #ffffff;

    border: 1px solid #2879ff;
    border-radius: 50%;

    background: #2879ff;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);

    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s;
    overflow: hidden;
`;

const Captions = styled.div`
    position: relative;
    display: flex;
    top: 32px;
    line-height: 1;
    font-size: 12px;
    color: #959595;
`;

const Caption = styled.div`
    flex: 1;

    ${is('left')`
        text-align: left;
    `}
    ${is('center')`
        text-align: center;
    `}
    ${is('right')`
        text-align: right;
    `}
`;

const Wrapper = styled.div`
    position: relative;
    height: ${({ showCaptions }) => (showCaptions ? 50 : 22)}px;
    user-select: none;
    cursor: pointer;

    &:before {
        position: absolute;
        content: '';
        top: 10px;
        left: 0;
        right: 0;
        height: 2px;
        border-radius: 1px;
        background: #e1e1e1;
    }

    ${is('red')`
        ${Progress} {
            background: #ff4e00;
        }
 
        ${Handle} {
            background: #ff4e00 !important;
            border-color: #ff4e00 !important;
        }
    `};

    -webkit-tap-highlight-color: transparent;
`;

export default class Slider extends PureComponent {
    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        min: PropTypes.number,
        max: PropTypes.number,
        red: PropTypes.bool,
        showCaptions: PropTypes.bool,
        hideHandleValue: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        value: 0,
        min: 0,
        max: 100,
        showCaptions: false,
        hideHandleValue: false,
    };

    rootRef = createRef();
    wrapperRef = createRef();

    componentDidMount() {
        this.wrapperRef.current.addEventListener('click', this.onClick);
        this.wrapperRef.current.addEventListener('mousedown', this.onMouseDown);
        this.wrapperRef.current.addEventListener('touchstart', this.onTouchStart);
    }

    componentWillUnmount() {
        this.removeListeners();
        this.wrapperRef.current.removeEventListener('click', this.onClick);
        this.wrapperRef.current.removeEventListener('mousedown', this.onMouseDown);
        this.wrapperRef.current.removeEventListener('touchstart', this.onTouchStart);
    }

    render() {
        const { min, max, hideHandleValue, showCaptions, ...passProps } = this.props;
        const value = Number(this.props.value);

        const percent = (100 * (value - min)) / (max - min) || 0;

        return (
            <Wrapper {...passProps} innerRef={this.wrapperRef} showCaptions={showCaptions}>
                <Progress width={percent} />
                <HandleSlot innerRef={this.rootRef}>
                    <HandleWrapper left={percent}>
                        <Handle>{hideHandleValue ? null : value}</Handle>
                    </HandleWrapper>
                </HandleSlot>
                {showCaptions && (
                    <Captions>
                        <Caption left>0%</Caption>
                        <Caption center>50%</Caption>
                        <Caption right>100%</Caption>
                    </Captions>
                )}
            </Wrapper>
        );
    }

    removeListeners() {
        if (this.isListenerActive) {
            this.isListenerActive = false;
            window.removeEventListener('mousemove', this.onMove);
            window.removeEventListener('mouseup', this.onMovingEnd);
            window.removeEventListener('touchmove', this.onMove);
            window.removeEventListener('touchend', this.onMovingEnd);
            window.removeEventListener('keydown', this.onKeyDown);
            window.removeEventListener('visibilitychange', this.onVisibilityChange);
        }
    }

    calculateValue(e) {
        const clientX = e.clientX || e.changedTouches[0].clientX;

        const { min, max } = this.props;
        const box = this.rootRef.current.getBoundingClientRect();

        const unbound = Math.round(min + ((max - min) * (clientX - box.left)) / box.width);

        return Math.min(max, Math.max(min, unbound));
    }

    resetMoving() {
        this.removeListeners();
    }

    onClick = e => {
        this.setState({
            value: this.calculateValue(e),
        });
    };

    onMouseDown = e => {
        this.setState({
            value: this.calculateValue(e),
        });

        if (!this.isListenerActive) {
            this.isListenerActive = true;
            window.addEventListener('mousemove', this.onMove);
            window.addEventListener('mouseup', this.onMovingEnd);
            window.addEventListener('keydown', this.onKeyDown);
            window.addEventListener('visibilitychange', this.onVisibilityChange);
        }
    };

    onTouchStart = e => {
        this.setState({
            value: this.calculateValue(e),
        });

        if (!this.isListenerActive) {
            this.isListenerActive = true;
            window.addEventListener('touchmove', this.onMove);
            window.addEventListener('touchend', this.onMovingEnd);
            window.addEventListener('visibilitychange', this.onVisibilityChange);
        }
    };

    onMove = e => {
        this.props.onChange(this.calculateValue(e));
    };

    onMovingEnd = e => {
        this.resetMoving();
        this.props.onChange(this.calculateValue(e));
    };

    onKeyDown = e => {
        if (e.which === keyCodes.ESCAPE) {
            this.resetMoving();
        }
    };

    onVisibilityChange = () => {
        if (document.hidden) {
            this.resetMoving();
        }
    };
}
