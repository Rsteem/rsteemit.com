import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import CloseOpenButton from '../cards/CloseOpenButton/CloseOpenButton';

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    padding: 15px 45px 15px 20px;
    margin-bottom: 20px;
    border-radius: 6px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);

    & ul {
        margin-bottom: 0;
    }

    @media (max-width: 1200px) {
        padding: 14px 34px 14px 16px;
    }
`;

const Title = styled.div`
    color: #212121;
    font-family: 'Open Sans', sans-serif;
    font-size: 20px;
    font-weight: bold;
    line-height: 34px;
    cursor: pointer;

    @media (max-width: 1200px) {
        font-size: 18px;
        line-height: 24px;
    }
`;

const Answer = styled.div`
    height: ${props => (props.showAnswer ? 'auto' : '0')};
    margin-top: ${props => (props.showAnswer ? '11px' : '0')};
    color: #959595;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    letter-spacing: -0.26px;
    line-height: 24px;
    overflow: hidden;
`;

const Switcher = styled(CloseOpenButton)`
    position: absolute;
    top: 18px;
    right: 12px;

    @media (max-width: 1200px) {
        top: 5px;
        right: 6px;
    }
`;

export default class Question extends PureComponent {
    static propTypes = {
        question: PropTypes.shape({
            title: PropTypes.string.isRequired,
            answer: PropTypes.string.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showAnswer: false,
        };
    }

    changeAnswerState = () => {
        this.setState({
            showAnswer: !this.state.showAnswer,
        });
    };

    render() {
        const { question } = this.props;
        const { showAnswer } = this.state;

        return (
            <Wrapper>
                <Switcher collapsed={!showAnswer} toggle={this.changeAnswerState} />
                <Title
                    onClick={this.changeAnswerState}
                    dangerouslySetInnerHTML={{ __html: question.title }}
                />
                <Answer
                    showAnswer={showAnswer}
                    dangerouslySetInnerHTML={{ __html: question.answer }}
                />
            </Wrapper>
        );
    }
}
