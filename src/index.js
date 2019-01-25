import Delta from 'quill-delta'
import normalizeUrl from 'normalize-url'

const defaults = {
  globalRegularExpression: /(https?:\/\/|www\.)[\S]+/g,
  urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)/,
  normalizeRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)/,
  youtubeRegularExpression: /(?:https?\:\/\/)?(?:(?:www\.)?youtube\.com|youtu\.?be)\/[\S]+/,
  normalizeUrlOptions: {
    stripFragment: false,
    stripWWW: false
  }
}

export default class MagicUrl {
  constructor (quill, options) {
    this.quill = quill
    options = options || {}
    this.options = {...defaults, ...options}
    this.registerTypeListener()
    this.registerPasteListener()
  }
  registerPasteListener () {
    this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
      if (typeof node.data !== 'string') {
        return
      }
      const youtube = node.data.match(this.options.youtubeRegularExpression)
      if (youtube && youtube.length > 0) {
        const newDelta = new Delta()
        let str = node.data
        youtube.forEach(match => {
          const split = str.split(match)
          const beforeLink = split.shift()
          newDelta.insert(beforeLink)
          newDelta.insert(match, {video: match})
          str = split.join(match)
        })
        newDelta.insert(str)
        delta.ops = newDelta.ops
      }else{
        const matches = node.data.match(this.options.globalRegularExpression)
        if (matches && matches.length > 0) {
          const newDelta = new Delta()
          let str = node.data
          matches.forEach(match => {
            const split = str.split(match)
            const beforeLink = split.shift()
            newDelta.insert(beforeLink)
            newDelta.insert(match, {link: match})
            str = split.join(match)
          })
          newDelta.insert(str)
          delta.ops = newDelta.ops
        }
      }
      return delta
    })
  }
  registerTypeListener () {
    this.quill.on('text-change', (delta) => {
      let ops = delta.ops
      // Only return true, if last operation includes whitespace inserts
      // Equivalent to listening for enter, tab or space
      if (!ops || ops.length < 1 || ops.length > 2) {
        return
      }
      let lastOp = ops[ops.length - 1]
      if (!lastOp.insert || typeof lastOp.insert !== 'string' || !lastOp.insert.match(/\s/)) {
        return
      }
      this.checkTextForUrl()
    })
  }
  checkTextForUrl () {
    let sel = this.quill.getSelection()
    if (!sel) {
      return
    }
    let [leaf] = this.quill.getLeaf(sel.index)
    if (!leaf.text || leaf.parent.domNode.localName === "a") {
      return
    }
    let urlMatch = leaf.text.match(this.options.youtubeRegularExpression)
    if(urlMatch){
      let leafIndex = this.quill.getIndex(leaf)
      let index = leafIndex + urlMatch.index
      
      this.textToUrl(index, urlMatch[0], 'video')
    }else{
      urlMatch = leaf.text.match(this.options.urlRegularExpression)
      if (!urlMatch) {
        return
      }
      let leafIndex = this.quill.getIndex(leaf)
      let index = leafIndex + urlMatch.index
      
      this.textToUrl(index, urlMatch[0])
    }
  }
  textToUrl (index, url, type = 'link') {
    const ops = new Delta()
      .retain(index)
      .delete(url.length)
      .insert(url, type === 'link'?{link: this.normalize(url)} : {video: this.normalize(url)})
    this.quill.updateContents(ops)
  }
  normalize (url) {
    if (this.options.normalizeRegularExpression.test(url)) {
      return normalizeUrl(url, this.options.normalizeUrlOptions)
    }
    return url
  }
}

if (window.Quill) {
  window.Quill.register('modules/magicUrl', MagicUrl);
}
