import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Container from 'src/app/components/common/Container/Container';
import SidePanel from 'src/app/containers/Post/SidePanel';
import { authorSelector, currentPostSelector } from '../../redux/selectors/post/post';
import PostContent from '../../components/post/PostContent';
import ActivePanel from './ActivePanel';
import AboutPanel from './AboutPanel';
import { USER_FOLLOW_DATA_LOAD } from '../../redux/constants/followers';
import { FAVORITES_LOAD } from '../../redux/constants/favorites';
import throttle from 'lodash/throttle';

const PAD_SCREEN_SIZE = 768;

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    background-color: #f9f9f9;
`;

const ContentWrapper = Container.extend`
    position: relative;
    padding-top: 22px;
    padding-bottom: 17px;
    display: flex;
    flex-direction: column;

    @media (max-width: 576px) {
        margin: 0;
        padding-top: 0;
    }
`;

class PostContainer extends Component {
    constructor(props) {
        super(props);
        props.loadUserFollowData(props.account);
        props.loadFavorites();
    }

    state = {
        isPadScreen: false,
    };

    componentDidMount() {
        this._checkScreenSize();
        window.addEventListener('resize', this.__checkScreenSizeLazy);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.__checkScreenSizeLazy);
        this.__checkScreenSizeLazy.cancel();
    }

    render() {
        const { postLoaded } = this.props;
        const { isPadScreen } = this.state;
        if (!postLoaded) return null;
        return (
            <Wrapper>
                <ContentWrapper>
                    <PostContent isPadScreen={isPadScreen} />
                    <ActivePanel isPadScreen={isPadScreen} />
                    <AboutPanel />
                    <SidePanel />
                </ContentWrapper>
            </Wrapper>
        );
    }

    _checkScreenSize = () => {
        const windowWidth = window.innerWidth;
        if (windowWidth <= PAD_SCREEN_SIZE && !this.state.isPadScreen) {
            this.setState({ isPadScreen: true });
        }
        if (windowWidth > PAD_SCREEN_SIZE && this.state.isPadScreen) {
            this.setState({ isPadScreen: false });
        }
    };

    __checkScreenSizeLazy = throttle(this._checkScreenSize, 100, { leading: true });
}

const mapStateToProps = (state, props) => {
    const post = currentPostSelector(state, props);
    const author = authorSelector(state, props);
    return {
        account: author.account,
        postLoaded: !!post,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadUserFollowData: username => {
            dispatch({
                type: USER_FOLLOW_DATA_LOAD,
                payload: {
                    username,
                },
            });
        },
        loadFavorites: () => {
            dispatch({
                type: FAVORITES_LOAD,
                payload: {},
            });
        },
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PostContainer);
