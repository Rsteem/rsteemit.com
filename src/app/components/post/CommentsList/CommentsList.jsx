import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InsetComment from 'src/app/components/post/InsetComment';

export class CommentsList extends Component {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        structuredComments: PropTypes.array.isRequired,
        saveListScrollPosition: PropTypes.func.isRequired,
    };

    render() {
        const { isFetching, structuredComments, saveListScrollPosition } = this.props;
        return structuredComments.map((comment, index) => (
            <InsetComment
                key={index}
                comment={comment}
                saveListScrollPosition={saveListScrollPosition}
            />
        ));
    }
}