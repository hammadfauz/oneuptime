import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RenderBasedOnRole from './RenderBasedOnRole';
import BasicButton from 'common-ui/components/basic/Button';

export default class Button extends Component {
    constructor(props: $TSFixMe) {
        super(props);
    }

    render() {
        const {

            visibleForOwner,

            visibleForAdmin,

            visibleForViewer,

            visibleForMember,

            visibleForAll = true,

            title,

            shortcutKey, id, onClick, disabled
        } = this.props;

        return (
            <RenderBasedOnRole

                visibleForOwner={visibleForOwner}
                visibleForAdmin={visibleForAdmin}
                visibleForViewer={visibleForViewer}
                visibleForMember={visibleForMember}
                visibleForAll={visibleForAll}
            >
                <BasicButton

                    title={title}
                    shortcutKey={shortcutKey}
                    id={id}
                    onClick={onClick}
                    disabled={disabled}
                />
            </RenderBasedOnRole>
        );
    }
}


Button.propTypes = {
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    id: PropTypes.string,
    shortcutKey: PropTypes.string,

    visibleForOwner: PropTypes.bool,
    visibleForAdmin: PropTypes.bool,
    visibleForViewer: PropTypes.bool,
    visibleForMember: PropTypes.bool,
    visibleForAll: PropTypes.bool,
};
