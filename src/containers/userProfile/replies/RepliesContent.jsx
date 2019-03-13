import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';
import tt from 'counterpart';

import LoadingIndicator from 'src/components/elements/LoadingIndicator';
import InfoBlock from 'src/components/common/InfoBlock';
import BlogCardsList from 'src/components/common/CardsList/BlogCardsList';
import EmptyBlock, { EmptySubText } from 'src/components/common/EmptyBlock';
import CommentCard from 'src/components/cards/CommentCard';
import CardsListWrapper from '../CardsListWrapper';
import { visuallyHidden } from 'src/helpers/styles';

const Loader = styled(LoadingIndicator)`
  margin-top: 30px;
`;

const Header = styled.h1`
  ${visuallyHidden};
`;

class RepliesContent extends Component {
  render() {
    const { pageAccount } = this.props;

    return (
      <Fragment>
        <Helmet title={tt('meta.title.profile.replies', { name: pageAccount.get('name') })} />
        <Header>{tt('g.replies')}</Header>
        <CardsListWrapper>{this._render()}</CardsListWrapper>
      </Fragment>
    );
  }

  itemRender(props) {
    return <CommentCard {...props} showSpam />;
  }

  _render() {
    const { pageAccount, isOwner } = this.props;

    const replies = pageAccount.get('recent_replies');

    if (!replies) {
      return <Loader type="circle" center size={40} />;
    }

    if (!replies.size) {
      return (
        <InfoBlock>
          <EmptyBlock>
            {tt('g.empty')}
            <EmptySubText>
              {isOwner
                ? tt('content.tip.replies.start_writing')
                : tt('content.tip.replies.user_has_no_replies')}
            </EmptySubText>
          </EmptyBlock>
        </InfoBlock>
      );
    }

    return (
      <BlogCardsList
        pageAccountName={pageAccount.get('name')}
        itemRender={this.itemRender}
        disallowGrid
        category="recent_replies"
        allowInlineReply={isOwner}
        order="by_replies"
      />
    );
  }
}

export default connect((state, props) => {
  const pageAccountName = props.params.accountName.toLowerCase();
  const pageAccount = state.global.getIn(['accounts', pageAccountName]);
  const isOwner = state.user.getIn(['current', 'username']) === pageAccountName;

  return {
    pageAccount,
    isOwner,
  };
})(RepliesContent);