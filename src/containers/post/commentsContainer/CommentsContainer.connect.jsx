import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { routePostSelector, commentsSelector } from 'src/app/redux/selectors/post/commonPost';
import { fetchCommentsIfNeeded } from 'src/app/redux/actions/comments';
import { CommentsContainer } from 'src/containers/post/commentsContainer/CommentsContainer';
import { locationSelector } from 'src/app/redux/selectors/app/location';

export default connect(
  createSelector(
    [routePostSelector, commentsSelector, locationSelector, state => state.ui.common],
    (data, commentsData, location, uiCommon) => ({
      pathname: location.get('pathname'),
      data,
      commentInputFocused: uiCommon.get('commentInputFocused'),
      ...commentsData,
    })
  ),

  {
    fetchCommentsIfNeeded,
  }
)(CommentsContainer);