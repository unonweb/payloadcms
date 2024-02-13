import { Button } from "payload/components";
import { useFormFields } from "payload/components/forms";
import React from "react";

export const deployButton = () => {
	let siteID
	useFormFields(([fields]) => {
		siteID = fields.site.value
	});

	return (
		<>
			<div className="deploy-button-wrapper">
				<a href={`/deploy-site?site=${siteID}`} target="_blank">
					<Button
						className="deploy-button"
						buttonStyle="secondary">Publish
					</Button>
				</a>
				<div className="field-description">Alle Änderungen hochladen. Das kann etwas dauern.</div>
				<ul className="field-description">
					<li>Erst speichern</li>
					<li>Erst am Ende der Sitzung ausführen</li>
				</ul>
			</div>

		</>
	);
};