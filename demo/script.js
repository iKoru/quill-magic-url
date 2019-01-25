// let BlockEmbed = Quill.import('blots/block/embed');
// class VideoBlot extends BlockEmbed {
// 	static create(url) {
// 		let node = super.create();
// 		node.setAttribute('src', url);
// 		node.setAttribute('frameborder', '0');
// 		node.setAttribute('allowfullscreen', true);
// 		return node;
// 	}

// 	static formats(node) {
// 		let format = {};
// 		if (node.hasAttribute('height')) {
// 			format.height = node.getAttribute('height');
// 		}
// 		if (node.hasAttribute('width')) {
// 			format.width = node.getAttribute('width');
// 		}
// 		return format;
// 	}

// 	static value(node) {
// 		return node.getAttribute('src');
// 	}

// 	format(name, value) {
// 		if (name === 'height' || name === 'width') {
// 			if (value) {
// 				this.domNode.setAttribute(name, value);
// 			} else {
// 				this.domNode.removeAttribute(name, value);
// 			}
// 		} else {
// 			super.format(name, value);
// 		}
// 	}
// }
// VideoBlot.blotName = 'video';
// VideoBlot.tagName = 'iframe';
// Quill.register(VideoBlot);
var quill = new Quill('#editor', {
	theme: 'snow',
	modules: {
		magicUrl: {
			globalRegularExpression: /(https?:\/\/|www\.|mailto:|tel:)[\S]+/g,
			urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)|(mailto:[\S]+)|(tel:[\S]+)/
		}
	},
	placeholder: 'Paste or type a url ...'
});