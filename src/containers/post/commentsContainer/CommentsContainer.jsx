import React, { Component, createRef } from 'react';
import styled from 'styled-components';

import CommentsHeader from 'src/components/post/CommentsHeader/CommentsHeader';
import CreateComment from 'src/components/post/CreateComment';
import CommentsList from 'src/components/post/CommentsList';

const Wrapper = styled.div`
  padding-top: 20px;

  @media (max-width: 576px) {
    margin: 0 20px;
  }
`;

export class CommentsContainer extends Component {
  commentContainerRef = createRef();

  componentDidMount() {
    this.updateComments();
  }

  updateComments = () => {
    const { postAuthor, postPermLink, fetchCommentsIfNeeded } = this.props;
    fetchCommentsIfNeeded(postAuthor, postPermLink);
  };

  render() {
    const { commentsCount, data, commentInputFocused, user } = this.props;
    return (
      <Wrapper ref={this.commentContainerRef}>
        <CommentsHeader commentsCount={commentsCount} />
        {user && (
          <CreateComment
            data={data}
            updateComments={this.updateComments}
            commentInputFocused={commentInputFocused}
            commentContainerRef={this.commentContainerRef}
          />
        )}
        <CommentsList updateComments={this.updateComments} />
      </Wrapper>
    );
  }
}