export default function initSitePaths(data) {
	// called by an beforeValidate hooks
	// receives a site data object
	// returns the modified site data
	
	data.paths.fs.admin.sites ??= '/home/payload/sites'

	// site
	data.paths.fs.site = `${data.paths.fs.admin.sites}/${data.domainShort}`
	// fonts
	data.paths.fs.fonts = `${data.paths.fs.admin.sites}/${data.domainShort}/assets`
	// docs
	data.paths.fs.docs = `${data.paths.fs.admin.sites}/${data.domainShort}/assets/docs`
	// imgs
	data.paths.fs.imgs = `${data.paths.fs.admin.sites}/${data.domainShort}/assets/imgs`
	
	// posts
	data.paths.fs.posts = `${data.paths.fs.admin.sites}/${data.domainShort}/assets/posts`
	// events
	data.paths.fs.events = `${data.paths.fs.admin.sites}/${data.domainShort}/assets/events`
	// products
	data.paths.fs.products = `${data.paths.fs.admin.sites}/${data.domainShort}/assets/products`

	return data
}