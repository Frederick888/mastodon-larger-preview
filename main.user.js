// ==UserScript==
// @name            Mastodon Larger Preview
// @namespace       https://onee3.org
// @version         0.1.1
// @description     Larger Open Graph preview images in Mastodon
// @copyright       2020, Frederick888 (https://openuserjs.org/users/Frederick888)
// @author          Frederick888
// @license         GPL-3.0-or-later
// @homepageURL     https://github.com/Frederick888/mastodon-larger-preview
// @supportURL      https://github.com/Frederick888/mastodon-larger-preview/issues
// @contributionURL https://github.com/Frederick888/mastodon-larger-preview/pull
// @updateURL       https://openuserjs.org/meta/Frederick888/Mastodon_Larger_Preview.meta.js
// @match           https://mastodon.ktachibana.party/*
// ==/UserScript==

let galleryTemplate = `
<div class="media-gallery">
    <div class="media-gallery__item" style="inset: auto; width: 100%; height: 100%;">
        <a class="media-gallery__item-thumbnail" href="" target="_blank" rel="noopener noreferrer">
            <img src=""
                srcset=""
                sizes="250px"
                style="object-position: 50.5% 20%;"
        /></a>
    </div>
</div>
`;

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function addLargerOpenGraph(container, ogImage) {
    let ogImageLink = ogImage.getAttribute('src');
    let ogContainer = ogImage.closest('.status-card');
    let ogLink = ogContainer.getAttribute('href');
    if (ogLink === null) {
        let oembedActionsLink = ogContainer.querySelector('.status-card__actions a[href]');
        if (oembedActionsLink !== null) {
            ogLink = oembedActionsLink.getAttribute('href');
        }
    }
    let actionBar = container.querySelector('.status__action-bar');

    let mediaGallery = htmlToElement(galleryTemplate);
    mediaGallery.querySelector('.media-gallery__item-thumbnail').setAttribute('href', ogLink);
    let mediaGalleryImg = mediaGallery.querySelector('img');
    mediaGalleryImg.setAttribute('src', ogImageLink);
    mediaGalleryImg.setAttribute('srcset', ogImageLink + ' 960w ' + ogImageLink + ' 346w');

    actionBar.before(mediaGallery);
}

function mainLoop() {
    document.querySelectorAll('img.status-card__image-image:not([og-larger-processed])')
        .forEach((ogImage) => {
            ogImage.setAttribute('og-larger-processed', '1');
            let container = ogImage.closest('.status__wrapper');
            if (container.querySelector('.media-gallery:not(.og-larger)') === null) {
                addLargerOpenGraph(container, ogImage);
            }
        });
}

(function () {
    'use strict';
    if (typeof MutationObserver === 'function') {
        let observerConfig = {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
        };
        let body = document.getElementsByTagName('body')[0];
        let observer = new MutationObserver(mainLoop);
        observer.observe(body, observerConfig);
    } else {
        mainLoop();
        setInterval(mainLoop, 200);
    }
})();
