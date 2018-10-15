import React, { Component } from 'react';
import styled from 'styled-components';

import CommentsHeader from 'src/app/components/post/CommentsHeader';
import CreateComment from 'src/app/components/post/CreateComment';
import CommentsList from 'src/app/components/post/CommentsList';

const Wrapper = styled.div`
    padding-top: 30px;
    
    @media (max-width: 576px) {
        margin: 0 20px;
    }
`;

export class CommentsContainer extends Component {
    componentDidMount() {
        this.updateComments();
    }

    updateComments = () => {
        const { postAuthor, postPermLink, fetchCommentsIfNeeded } = this.props;
        fetchCommentsIfNeeded(postAuthor, postPermLink);
    };

    render() {
        const {
            commentsCount,
            data,
            comments,
            isFetching,
            saveListScrollPosition,
        } = this.props;

        return (
            <Wrapper>
                <CommentsHeader commentsCount={commentsCount} />
                <CreateComment data={data} updateComments={this.updateComments} />
                <CommentsList
                    comments={comments}
                    isFetching={isFetching}
                    saveListScrollPosition={saveListScrollPosition}
                />
            </Wrapper>
        );
    }
}
