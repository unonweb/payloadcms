import * as React from "react";

export const CustomPublishButton = ({
	DefaultButton,
	disabled,
	label,
	publish,
}) => {
	return <DefaultButton label={label} disabled={disabled} publish={publish} />;
};