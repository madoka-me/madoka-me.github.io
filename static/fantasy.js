/* ----

# Fantasy Theme
# By: Dreamer-Paul
# Last Update: 2021.3.2

一个优美梦幻的动漫风 Typecho 博客主题。

本代码为奇趣保罗原创，并遵守 MIT 开源协议。欢迎访问我的博客：https://paugram.com

---- */

var Fantasy_Theme = function (config) {
    var that = this;
    var element = {
        aside: ks.select("aside"),
        toggle: ks.select("header .toggle"),
        search: {
            btn: ks.select(".search-btn"),
            window: ks.select(".side-window"),
            input: ks.select(".side-window input")
        },
        content: ks.select(".post-content"),
        comment: {
            form: ks.select(".comment-form"),
            list: ks.select(".comment-list"),
            mail: document.getElementsByName("mail")[0],
            avatar: ks.select(".comment-avatar img")
        },
        footer: {
            action: ks.select(".foot-action"),
            top: ks.select(".to-top"),
        },
        date: ks.select(".foot-date"),
        hitokoto: ks.select(".foot-hitokoto")
    };

    // 菜单按钮
    this.header = function () {
        element.toggle.onclick = function () {
            element.aside.classList.toggle("active");
        };

        element.search.btn.onclick = function () {
            element.search.input.focus();
            element.search.window.classList.toggle("active");
        };

        ks(".nav-item.has-child").each(function (item) {
            item.onclick = (t) => {
                if(!t.target.classList.contains("wrapper")) item.classList.toggle("active");
            }
        });
    };
    this.header();

    // 自动添加外链
    this.links = function (selector) {
        var links = selector.getElementsByTagName("a");

        for(var i = 0; i < links.length; i++){
            links[i].target = "_blank";
        }
    };

    // 评论
    this.comments = function () {
        element.comment.mail.onblur = function (event) {
            var reg = /@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/;

            if(reg.test(event.target.value)){
                element.comment.avatar.src = "?action=gravatar&email=" + event.target.value;
            }
        }
    };

    // 返回头部
    this.to_top = function () {
        element.footer.top.onclick = function () {
            window.scrollTo(0, 0);
        };

        window.addEventListener("scroll", function () {
            var scroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            scroll >= window.innerHeight ? element.footer.top.classList.add("active") : element.footer.top.classList.remove("active");
        });
    };
    this.to_top();

    // 运行时间
    this.foot_date = function (date) {
        function run_date(date){
            var created = Date.parse(date);
            var now = new Date().getTime();
            var ran = now - created;

            var day = ran / 86400000;
            var day_c = Math.floor(day);

            var hour = 24 * (day - day_c);
            var hour_c = Math.floor(hour);

            var min = 60 * (hour - hour_c);
            var min_c = Math.floor(min);

            var sec = Math.floor(60 * (min - min_c));

            return "站点已萌萌哒存活了 <a>" + day_c + "</a> 天 <a>" + hour_c + "</a> 小时 <a>" + min_c + "</a> 分 <a>" + sec + "</a> 秒";
        }

        setInterval(function () {
            element.date.innerHTML = run_date(date);
        }, 1000);
    };
    if(element.date && config.created) this.foot_date(config.created);

    // 一言
    this.hitokoto = function (source) {
        ks.ajax({
            method: "GET",
            url: "https://v1.hitokoto.cn",
            success: function (req){
                element.hitokoto.innerText = JSON.parse(req.response)["hitokoto"];
            },
            failed: function (req){
                ks.notice("请求一言失败！" + aaaa, {color: "red", time: 1500});
            }
        });
    };

    // 文章扩展
    this.post_action = function () {
        var btn = {
            likes: ks.select(".post-action.likes"),
            share: ks.select(".post-action.share"),
            donate: ks.select(".post-action.donate")
        }, window = {
            share: ks.select(".window-share"),
            donate: ks.select(".window-donate")
        }, qrcode = ks.select(".window-share .qrcode img");

        btn.likes.onclick = function (t) {
            if(btn.likes.checked){
                ks.notice("你已经点过赞了喔", {color: "red", time: 1500});
            }
            else{
                btn.likes.checked = true;
                t.currentTarget.childNodes[1].innerText = parseInt(t.currentTarget.childNodes[1].innerText) + 1;

                ks.ajax({
                    data: {
                        cid: t.target.dataset.cid,
                        action: "likes"
                    },
                    type: "text",
                    method: "POST",
                    success: function (text) {
                        if(text === "false"){
                            ks.notice("你已经点过赞了喔", {color: "red", time: 1500});
                            t.currentTarget.childNodes[1].innerText = parseInt(t.currentTarget.childNodes[1].innerText) - 1;
                        }
                    },
                    failed: function () {
                        btn.likes.checked = false;
                    }
                });
            }

        };

        btn.share.onclick = function () {
            window.share.classList.toggle("active");
            window.donate.classList.remove("active");

            if(!qrcode.gen){
                qrcode.gen = true;
                qrcode.src = "https://api.imjad.cn/qrcode/?text=" + location.href;
            }
        };

        btn.donate.onclick = function () {
            window.share.classList.remove("active");
            window.donate.classList.toggle("active");
        };

        window.share.onclick = function (e) {
            this.classList.remove("active");
        };

        window.donate.onclick = function () {
            this.classList.remove("active");
        }
    };

    this.copyToClipboard = function (text) {
        function copy(ev) {
            ev.clipboardData.setData('text', text);
            ev.preventDefault();
            ks.notice("已复制文章链接", {color: "green", time: 1500});
        }

        if(window.clipboardData){
            window.clipboardData.setData('text', text);
        }
        else{
            document.addEventListener("copy", copy);
            document.execCommand("copy");
            document.removeEventListener("copy", copy);
        }
    };

    // 目录树
    this.tree = function () {
        var id = 1;
        var wrap = ks.select("main .wrap");
        var headings = element.content.querySelectorAll("h1, h2, h3, h4, h5, h6");

        if(headings.length > 0){
            var inner = ks.create("div", {class: "contents"});

            var trees = ks.create("section", {
                class: "article-list",
                child: [
                    ks.create("div", {class: "container", child: inner})
                ]
            });

            ks.each(headings, function (t) {
                var cls, text = t.innerText;

                t.id = "title-" + id;

                switch (t.tagName){
                    case "H2": cls = "item-2"; break;
                    case "H3": cls = "item-3"; break;
                    case "H4": cls = "item-4"; break;
                    case "H5": cls = "item-5"; break;
                    case "H6": cls = "item-6"; break;
                }

                inner.appendChild(ks.create("a", {class: cls, text: text, href: "#title-" + id}));

                id++;
            });

            wrap.appendChild(trees);

            function toggle_tree() {
                var btn = ks.create("div", {class: "toggle-list"});
                element.footer.action.appendChild(btn);
                element.footer.article = btn;

                btn.addEventListener("click", function () {
                    trees.classList.toggle("active");
                })
            }
            toggle_tree();
        }
    };

    this.init = function () {
        element.content = ks.select(".post-content");
        element.comment = {
            form: ks.select(".comment-form"),
            list: ks.select(".comment-list"),
            mail: document.getElementsByName("mail")[0],
            avatar: ks.select(".comment-avatar img")
        };

        if(element.hitokoto) this.hitokoto();
        if(element.content){
            this.links(element.content);
            this.tree();
        }
        if(element.comment.list) this.links(element.comment.list);
        if(element.comment.form && element.comment.mail) this.comments();

        if(ks.select(".post-actions")) this.post_action();
        
        // 修复中文链接 PJAX 白屏问题
        ks("a").each(function (item) {
            var href = item.getAttribute("href");
            // 检测是否包含中文，如果包含则进行编码
            if (href && /[\u4e00-\u9fa5]/.test(href)) {
                item.href = encodeURI(href);
            }
        });

        ks.image(".post-content:not(.exclude-image) img");

        if(Prism) Prism.highlightAll();
    };
    this.init();

    var pjax = new Pjax({
        // 注意：搜索表单(form) 通常会导致跳转，如果 PJAX 处理重定向有问题，
        // 这里的 'form' 可能需要根据情况移除。
        // 但既然你之前解决了 PJAX 问题，这里保留你之前的设置。
        elements: "a:not([target=_blank]), form",
        selectors: [
            "title", "meta[name=description]", "main"
        ],
        cacheBust: false
    });

    document.addEventListener('pjax:send', function (){
        if(element.footer.article){
            element.footer.action.removeChild(element.footer.article);
            element.footer.article = null;
        }

        document.body.classList.add("onload");

        element.aside.classList.remove("active");
        element.search.window.classList.remove("active");
    });

    document.addEventListener('pjax:complete', function (){
        document.body.classList.remove("onload");

        that.init();

        if(ks.select(".comment-form")){
            window.TypechoComment = {
                dom: function (id) {
                    return document.getElementById(id);
                },
                create: function (tag, attr) {
                    var el = document.createElement(tag);

                    for (var key in attr) {
                        el.setAttribute(key, attr[key]);
                    }

                    return el;
                },
                reply: function (cid, coid) {
                    var comment = this.dom(cid), parent = comment.parentNode,
                        response = ks.select(".comment-form"), input = this.dom('comment-parent'),
                        textarea = response.getElementsByTagName('textarea')[0];

                    if(null === input) {
                        input = this.create('input', {
                            'type' : 'hidden',
                            'name' : 'parent',
                            'id'   : 'comment-parent'
                        });

                        response.appendChild(input);
                    }

                    input.setAttribute('value', coid);

                    if(null === this.dom('comment-form-place-holder')) {
                        var holder = this.create('div', {
                            'id' : 'comment-form-place-holder'
                        });

                        response.parentNode.insertBefore(holder, response);
                    }

                    comment.appendChild(response);
                    this.dom('cancel-comment-reply-link').style.display = '';

                    if(null !== textarea && 'text' === textarea.name) {
                        textarea.focus();
                    }

                    return false;
                },
                cancelReply: function () {
                    var response = ks.select(".comment-form"),
                        holder = this.dom('comment-form-place-holder'), input = this.dom('comment-parent');

                    if(null !== input) {
                        input.parentNode.removeChild(input);
                    }

                    if(null === holder) {
                        return true;
                    }

                    this.dom('cancel-comment-reply-link').style.display = 'none';
                    holder.parentNode.insertBefore(response, holder);
                    return false;
                }
            };
        }
    });
};

// 请保留版权说明
if (window.console && window.console.log) {
    console.log("%c Fantasy %c https://paugram.com ","color: #fff; margin: 1em 0; padding: 5px 0; background: #ffa9be;","margin: 1em 0; padding: 5px 0; background: #efefef;");
}