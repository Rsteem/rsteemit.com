import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { currentUsernameSelector, uiSelector } from 'src/app/redux/selectors/common';
import { openRepostDialog, openVotersDialog } from 'src/app/redux/actions/dialogs';
import { SidePanel } from 'src/app/containers/post/sidePanel/SidePanel';
import { onBackClick } from 'src/app/redux/actions/post';
import { onVote } from 'src/app/redux/actions/vote';
import {
    currentPostSelector,
    authorSelector,
    votesSummarySelector,
} from 'src/app/redux/selectors/post/commonPost';

export default connect(
    createSelector(
        [
            currentPostSelector,
            authorSelector,
            currentUsernameSelector,
            votesSummarySelector,
            uiSelector('location'),
        ],
        (post, author, username, votesSummary, location) => {
            const prev = location.get('previous');
            let backURL = null;

            if (prev) {
                backURL = prev.get('pathname') + prev.get('search') + prev.get('hash');
            }

            return {
                votesSummary,
                username,
                backURL,
                author: author.account,
                permLink: post.permLink,
                myVote: post.myVote,
                fullUrl: post.url,
                isOwner: username === author.account,
                isFavorite: post.isFavorite,
                isPinned: author.pinnedPostsUrls.includes(author.account + '/' + post.permLink),
            };
        }
    ),
    {
        onVote,
        showVotedUsersList: openVotersDialog,
        openRepostDialog,
        onBackClick,
    }
)(SidePanel);
