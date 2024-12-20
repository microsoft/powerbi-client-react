// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { provideFluentDesignSystem, fluentDialog, fluentButton } from '@fluentui/web-components';
import { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import './EventDetailsDialogComponent.css';

const { wrap } = provideReactWrapper(React, provideFluentDesignSystem());

export const FluentDialog = wrap(fluentDialog());
export const FluentButton = wrap(fluentButton());

interface EventDetailsDialogProps {
    isOpen: boolean;
    onRequestClose: () => void;
    dataSelectedEventDetails: any;
}

const EventDetailsDialog = ({
    isOpen,
    onRequestClose,
    dataSelectedEventDetails,
}: EventDetailsDialogProps) => {
    return (
        isOpen ? (
            <FluentDialog>
                <div className="dialog-header-event-details">
                    <h1>Event Details</h1>
                    <button className="close-icon-button" onClick={onRequestClose}>&#x2715;</button>
                </div>
                <div className="dialog-main-event-details" tabIndex={0}>
                    <pre>{JSON.stringify(dataSelectedEventDetails, null, 2)}</pre>
                </div>
                <FluentButton className="event-details-close-button" onClick={onRequestClose}>Close</FluentButton>
            </FluentDialog>
        ) : null
    );
};

export default EventDetailsDialog;