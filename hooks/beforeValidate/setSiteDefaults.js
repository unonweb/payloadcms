import payload from 'payload'
import capitalizeWords from '../../helpers/_capitalizeWords'
import log from '../../helpers/customLog'

export default async function setSiteDefaults({ data, operation }) {
	/*
		Type:
			beforeValidate collection
		Task:
			Set default values on creation
	*/
	try {

		if (operation === 'create') {

			/* constants */
			const domainShort = data.domain.slice(0, data.domain.lastIndexOf('.')) // radjajuschka.de --> radjajuschka
			const admin = await payload.findGlobal({ slug: 'admin' })

			/* default values */
			data.domainShort ??= domainShort // site.domainShort
			data.brandName ??= capitalizeWords(domainShort.replaceAll('-', ' ')) // "haerer-geruestbau" --> "Haerer Geruestbau"
			
			data.paths.web.origin.dev ??= `http://${domainShort}.unonweb.local`
			data.paths.web.origin.prod ??= `https://${data.domain}`
			data.paths.web.admin.resources = admin.paths.web.resources
			
			data.paths.fs.admin.sites = admin.paths.fs.sites
			data.paths.fs.admin.customElements = admin.paths.fs.customElements
			data.paths.fs.admin.sites ??= '/home/payload/sites'

			data.paths.fs.site = `${data.paths.fs.admin.sites}/${data.domainShort}` // site
			data.paths.fs.fonts = `${data.paths.fs.admin.sites}/${data.domainShort}/assets` // fonts
			data.paths.fs.docs = `${data.paths.fs.admin.sites}/${data.domainShort}/assets/docs` // docs
			data.paths.fs.imgs = `${data.paths.fs.admin.sites}/${data.domainShort}/assets/imgs` // imgs
		
		}

		return data

	} catch (error) {
		log(err.stack, user, __filename, 3)
	}
}