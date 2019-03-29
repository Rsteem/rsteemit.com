import React, { Component } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import tt from 'counterpart';

import Icon from 'golos-ui/Icon';

const INVALIDATION_INTERVAL = 60 * 1000;

const EyeIcon = styled(Icon).attrs({ name: 'eye' })`
    width: 20px;
    color: #333;
`;

const Text = styled.div`
    margin: 0 -1px 0 10px;
`;

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 3px 0;
    font-size: 18px;
    letter-spacing: 1.6px;
    color: #757575;
    user-select: none;
    cursor: default;

    ${is('mini')`
        font-size: 16px;
        letter-spacing: 1.4px;
        
        ${EyeIcon} {
            width: 22px;
        }
    `};

    ${is('micro')`
        font-size: 12px;
        letter-spacing: normal;
        
        ${EyeIcon} {
            width: 19px;
            color: #959595;
        }
        
        ${Text} {
            margin-left: 6px;
        }
    `};
`;

export default class ViewCount extends Component {
    componentDidMount() {
        const { viewCount, postLink, timestamp } = this.props;

        if (
            viewCount === null ||
            viewCount === undefined ||
            (timestamp && timestamp + INVALIDATION_INTERVAL > Date.now())
        ) {
            this.props.fetchViewCount(postLink);
        }
    }

    render() {
        const { viewCount, mini, micro, className } = this.props;

        if (viewCount === null || viewCount === undefined) {
            return null;
        }

        const hint = tt('view_count.view_count');

        return (
            <Wrapper
                data-tooltip={hint}
                aria-label={hint}
                mini={mini}
                micro={micro}
                className={className}
            >
                <EyeIcon />
                <Text>{viewCount}</Text>
            </Wrapper>
        );
    }
}