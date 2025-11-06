var ic=Object.defineProperty;var i=(Fl,oi)=>ic(Fl,"name",{value:oi,configurable:!0});(()=>{var Fl={2410:(k,_,j)=>{"use strict";j.d(_,{A:i(()=>A,"A")});var Y=j(1601),$=j.n(Y),T=j(6314),g=j.n(T),h=g()($());h.push([k.id,`/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

body a {
	text-decoration: var(--text-link-decoration);
}

h3 {
	display: unset;
	font-size: unset;
	margin-block-start: unset;
	margin-block-end: unset;
	margin-inline-start: unset;
	margin-inline-end: unset;
	font-weight: unset;
}

body a:hover {
	text-decoration: underline;
}

button,
input[type='submit'] {
	color: var(--vscode-button-foreground);
	font-family: var(--vscode-font-family);
	border-radius: 2px;
	border: 1px solid transparent;
	padding: 4px 12px;
	font-size: 13px;
	line-height: 18px;
	white-space: nowrap;
	user-select: none;
}

button:not(.icon-button):not(.danger):not(.secondary),
input[type='submit'] {
	background-color: var(--vscode-button-background);
}

input.select-left {
	border-radius: 2px 0 0 2px;
}

button.select-right {
	border-radius: 0 2px 2px 0;
	width: 24px;
	position: relative;
}

button.select-right span {
	position: absolute;
	top: 2px;
	right: 4px;
}

button:focus,
input[type='submit']:focus {
	outline-color: var(--vscode-focusBorder);
	outline-style: solid;
	outline-width: 1px;
	outline-offset: 2px;
}

button:hover:enabled,
button:focus:enabled,
input[type='submit']:focus:enabled,
input[type='submit']:hover:enabled {
	background-color: var(--vscode-button-hoverBackground);
	cursor: pointer;
}

button.secondary {
	background-color: var(--vscode-button-secondaryBackground);
	color: var(--vscode-button-secondaryForeground);
}

button.secondary:hover:enabled,
button.secondary:focus:enabled,
input[type='submit'].secondary:focus:enabled,
input[type='submit'].secondary:hover:enabled {
	background-color: var(--vscode-button-secondaryHoverBackground);
}

textarea,
input[type='text'] {
	display: block;
	box-sizing: border-box;
	padding: 8px;
	width: 100%;
	resize: vertical;
	font-size: 13px;
	border: 1px solid var(--vscode-dropdown-border);
	background-color: var(--vscode-input-background);
	color: var(--vscode-input-foreground);
	font-family: var(--vscode-font-family);
	border-radius: 2px;
}

textarea::placeholder,
input[type='text']::placeholder {
	color: var(--vscode-input-placeholderForeground);
}

select {
	display: block;
	box-sizing: border-box;
	padding: 4px 8px;
	border-radius: 2px;
	font-size: 13px;
	border: 1px solid var(--vscode-dropdown-border);
	background-color: var(--vscode-dropdown-background);
	color: var(--vscode-dropdown-foreground);
}

textarea:focus,
input[type='text']:focus,
input[type='checkbox']:focus,
select:focus {
	outline: 1px solid var(--vscode-focusBorder);
}

input[type='checkbox'] {
	outline-offset: 1px;
}

.vscode-high-contrast input[type='checkbox'] {
	outline: 1px solid var(--vscode-contrastBorder);
}

.vscode-high-contrast input[type='checkbox']:focus {
	outline: 1px solid var(--vscode-contrastActiveBorder);
}

svg path:first-of-type {
	fill: var(--vscode-foreground);
}

body button:disabled,
input[type='submit']:disabled {
	opacity: 0.4;
}

body .hidden {
	display: none !important;
}

body img.avatar,
body span.avatar-icon svg {
	width: 20px;
	height: 20px;
	border-radius: 50%;
}

body img.avatar {
	vertical-align: middle;
}

.avatar-link {
	flex-shrink: 0;
}

.icon-button {
	display: flex;
	padding: 2px;
	background: transparent;
	border-radius: 4px;
	line-height: 0;
}

.icon-button:hover,
.title .icon-button:hover,
.title .icon-button:focus,
.section .icon-button:hover,
.section .icon-button:focus {
	background-color: var(--vscode-toolbar-hoverBackground);
}

.icon-button:focus,
.title .icon-button:focus,
.section .icon-button:focus {
	outline: 1px solid var(--vscode-focusBorder);
	outline-offset: 1px;
}

.label .icon-button:hover,
.label .icon-button:focus {
	background-color: transparent;
}

.section-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.section-item .avatar-link {
	margin-right: 8px;
}

.section-item .avatar-container {
	flex-shrink: 0;
}

.section-item .login {
	width: 129px;
	flex-shrink: 0;
}

.section-item img.avatar {
	width: 20px;
	height: 20px;
}

.section-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 3px;
}

.section-icon.changes svg path {
	fill: var(--vscode-list-errorForeground);
}

.section-icon.commented svg path,
.section-icon.requested svg path {
	fill: var(--vscode-list-warningForeground);
}

.section-icon.approved svg path {
	fill: var(--vscode-issues-open);
}

.reviewer-icons {
	display: flex;
	gap: 4px;
}

.push-right {
	margin-left: auto;
}

.avatar-with-author {
	display: flex;
	align-items: center;
}

.author-link {
	font-weight: 600;
	color: var(--vscode-editor-foreground);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.status-item button {
	margin-left: auto;
	margin-right: 0;
}

.automerge-section {
	display: flex;
}

.automerge-section,
.status-section {
	flex-wrap: wrap;
}

#status-checks .automerge-section {
	align-items: center;
	padding: 16px;
	background: var(--vscode-editorHoverWidget-background);
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
}

.automerge-section .merge-select-container {
	margin-left: 8px;
}

.automerge-checkbox-wrapper,
.automerge-checkbox-label {
	display: flex;
	align-items: center;
	margin-right: 4px;
}

.automerge-checkbox-label {
	min-width: 80px;
}

.merge-queue-title .merge-queue-pending {
	color: var(--vscode-list-warningForeground);
}

.merge-queue-title .merge-queue-blocked {
	color: var(--vscode-list-errorForeground);
}

.merge-queue-title {
	font-weight: bold;
	font-size: larger;
}

/** Theming */

.vscode-high-contrast button:not(.secondary):not(.icon-button) {
	background: var(--vscode-button-background);
}


.vscode-high-contrast input {
	outline: none;
	background: var(--vscode-input-background);
	border: 1px solid var(--vscode-contrastBorder);
}

.vscode-high-contrast button:focus {
	border: 1px solid var(--vscode-contrastActiveBorder);
}

.vscode-high-contrast button:hover {
	border: 1px dotted var(--vscode-contrastActiveBorder);
}

::-webkit-scrollbar-corner {
	display: none;
}

.labels-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.label {
	display: flex;
	justify-content: normal;
	padding: 0 8px;
	border-radius: 20px;
	border-style: solid;
	border-width: 1px;
	background: var(--vscode-badge-background);
	color: var(--vscode-badge-foreground);
	font-size: 11px;
	line-height: 18px;
	font-weight: 600;
}

/* split button */

.primary-split-button {
	display: flex;
	flex-grow: 1;
	min-width: 0;
	max-width: 260px;
}

button.split-left {
	border-radius: 2px 0 0 2px;
	flex-grow: 1;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	display: flex;
}

.split {
	background-color: var(--vscode-button-background);
	border-top: 1px solid var(--vscode-button-border);
	border-bottom: 1px solid var(--vscode-button-border);
	padding: 4px 0;
}

.split .separator {
	height: 100%;
	width: 1px;
	background-color: var(--vscode-button-separator);
}

.split.disabled {
	opacity: 0.4;
}

.split.secondary {
	background-color: var(--vscode-button-secondaryBackground);
	border-top: 1px solid var(--vscode-button-secondaryBorder);
	border-bottom: 1px solid var(--vscode-button-secondaryBorder);
}

button.split-right {
	border-radius: 0 2px 2px 0;
	cursor: pointer;
	width: 24px;
	position: relative;
}

button.split-right:disabled {
	cursor: default;
}

button.split-right .icon {
	pointer-events: none;
	position: absolute;
	top: 4px;
	right: 4px;
}

button.split-right .icon svg path {
	fill: unset;
}

button.input-box {
	display: block;
	height: 24px;
	margin-top: -4px;
	padding-top: 2px;
	padding-left: 8px;
	text-align: left;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--vscode-input-foreground) !important;
	background-color: var(--vscode-input-background) !important;
}

button.input-box:active,
button.input-box:focus {
	color: var(--vscode-inputOption-activeForeground) !important;
	background-color: var(--vscode-inputOption-activeBackground) !important;
}

button.input-box:hover:not(:disabled) {
	background-color: var(--vscode-inputOption-hoverBackground) !important;
}

button.input-box:focus {
	border-color: var(--vscode-focusBorder) !important;
}

.dropdown-container {
	display: flex;
	min-width: 0;
	margin: 0;
}

.dropdown-container.spreadable {
	flex-grow: 1;
	width: 100%;
}

button.inlined-dropdown {
	width: 100%;
	max-width: 150px;
	margin-right: 8px;
	display: inline-block;
	text-align: center;
}

button.inlined-dropdown:last-child {
	margin-right: 0;
}

.spinner {
	margin-top: 5px;
	margin-left: 5px;
}

.commit-spinner-inline {
	margin-left: 8px;
	display: inline-flex;
	align-items: center;
	vertical-align: middle;
	grid-column: none;
}

.commit-spinner-before {
	margin-right: 6px;
	display: inline-flex;
	align-items: center;
	vertical-align: middle;
}

.loading {
	animation: spinner-rotate 1s linear infinite;
}

@keyframes spinner-rotate {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}`,""]);const A=h},3554:(k,_,j)=>{"use strict";j.d(_,{A:i(()=>A,"A")});var Y=j(1601),$=j.n(Y),T=j(6314),g=j.n(T),h=g()($());h.push([k.id,`/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

#app {
	display: grid;
	grid-template-columns: 1fr minmax(200px, 300px);
	column-gap: 32px;
}

#title {
	grid-column-start: 1;
	grid-column-end: 3;
	grid-row: 1;
}

#main {
	grid-column: 1;
	grid-row: 2;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

#sidebar {
	display: flex;
	flex-direction: column;
	gap: 16px;
	grid-column: 2;
	grid-row: 2;
}

#project a {
	cursor: pointer;
}

a:focus,
input:focus,
select:focus,
textarea:focus,
.title-text:focus {
	outline: 1px solid var(--vscode-focusBorder);
}

.title-text {
	margin-right: 5px;
}

.title {
	display: flex;
	align-items: flex-start;
	margin: 20px 0 24px;
	padding-bottom: 24px;
	border-bottom: 1px solid var(--vscode-list-inactiveSelectionBackground);
}

.title .pr-number {
	margin-left: 5px;
}

.loading-indicator {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.loading-button {
	display: inline-flex;
	align-items: center;
	margin-right: 4px;
}

.comment-body li div {
	display: inline;
}

.comment-body li div.Box,
.comment-body li div.Box div {
	display: block;
}

.comment-body code,
.comment-body a,
span.lineContent {
	overflow-wrap: anywhere;
}

.comment-reactions {
	display: flex;
	flex-direction: row;
}

.comment-reactions div {
	font-size: 1.1em;
	cursor: pointer;
	user-select: none;
}

.comment-reactions .reaction-label {
	border-radius: 5px;
	border: 1px solid var(--vscode-panel-border);
	width: 14px;
}

#title:empty {
	border: none;
}

h2 {
	margin: 0;
}

body hr {
	display: block;
	height: 1px;
	border: 0;
	border-top: 1px solid #555;
	margin: 0 !important;
	padding: 0;
}

body .comment-container .avatar-container {
	margin-right: 12px;
}

body .comment-container .avatar-container a {
	display: flex;
}

body .comment-container .avatar-container img.avatar,
body .comment-container .avatar-container .avatar-icon svg {
	margin-right: 0;
}

.vscode-light .avatar-icon {
	filter: invert(100%);
}

body a.avatar-link:focus {
	outline-offset: 2px;
}

body .comment-container.comment,
body .comment-container.review {
	background-color: var(--vscode-editor-background);
}

.review-comment-container {
	width: 100%;
	max-width: 1000px;
	display: flex;
	flex-direction: column;
	position: relative;
}

body #main>.comment-container>.review-comment-container>.review-comment-header:not(:nth-last-child(2)) {
	border-bottom: 1px solid var(--vscode-editorHoverWidget-border);
}

body .comment-container .review-comment-header {
	position: relative;
	display: flex;
	width: 100%;
	box-sizing: border-box;
	padding: 8px 16px;
	color: var(--vscode-foreground);
	align-items: center;
	background: var(--vscode-editorWidget-background);
	border-top-left-radius: 3px;
	border-top-right-radius: 3px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.review-comment-header.no-details {
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
}

.description-header {
	float: right;
	height: 32px;
}

.review-comment-header .comment-actions {
	margin-left: auto;
}

.review-comment-header .pending {
	color: inherit;
	font-style: italic;
}

.comment-actions button {
	background-color: transparent;
	padding: 0;
	line-height: normal;
	font-size: 11px;
}

.comment-actions button svg {
	margin-right: 0;
	height: 14px;
}

.comment-actions .icon-button {
	padding-left: 2px;
	padding-top: 2px;
}

.status-scroll {
	max-height: 220px;
	overflow-y: auto;
}

.status-check {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	border-bottom: 1px solid var(--vscode-editorHoverWidget-border);
}

.status-check-details {
	display: flex;
	align-items: center;
	gap: 8px;
}

#merge-on-github {
	margin-top: 10px;
}

.status-item {
	padding: 12px 16px;
	border-bottom: 1px solid var(--vscode-editorHoverWidget-border);
}

.status-item:first-of-type {
	background: var(--vscode-editorWidget-background);
	border-top-left-radius: 3px;
	border-top-right-radius: 3px;
}

.status-item,
.form-actions,
.ready-for-review-text-wrapper {
	display: flex;
	gap: 8px;
	align-items: center;
}

.status-item .button-container {
	margin-left: auto;
	margin-right: 0;
}

.commit-association {
	display: flex;
	font-style: italic;
	flex-direction: row-reverse;
	padding-top: 7px;
}

.commit-association span {
	flex-direction: row;
}

.email {
	font-weight: bold;
}

button.input-box {
	float: right;
}

.status-item-detail-text {
	display: flex;
	gap: 8px;
}

.status-check-detail-text {
	margin-right: 8px;
}

.status-section p {
	margin: 0;
}

.status-section .check svg path {
	fill: var(--vscode-issues-open);
}

.status-section .close svg path {
	fill: var(--vscode-errorForeground);
}

.status-section .pending svg path,
.status-section .skip svg path {
	fill: var(--vscode-list-warningForeground);
}

.merge-queue-container,
.ready-for-review-container {
	padding: 16px;
	background-color: var(--vscode-editorWidget-background);
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.ready-for-review-icon {
	width: 16px;
	height: 16px;
}

.ready-for-review-heading {
	font-weight: 600;
}

.ready-for-review-meta {
	font-size: 0.9;
}

#status-checks {
	border: 1px solid var(--vscode-editorHoverWidget-border);
	border-radius: 4px;
}

#status-checks .label {
	display: inline-flex;
	margin-right: 16px;
}

#status-checks a {
	cursor: pointer;
}

#status-checks summary {
	display: flex;
	align-items: center;
}

#status-checks-display-button {
	margin-left: auto;
}

#status-checks .avatar-link svg {
	width: 24px;
	margin-right: 0px;
	vertical-align: middle;
}

.status-check .avatar-link .avatar-icon {
	margin-right: 0px;
}

#status-checks .merge-select-container {
	display: flex;
	align-items: center;
	background-color: var(--vscode-editorWidget-background);
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
}

#status-checks .merge-select-container>* {
	margin-right: 5px;
}

#status-checks .merge-select-container>select {
	margin-left: 5px;
}

#status-checks .branch-status-container {
	display: inline-block;
}

#status-checks .branch-status-message {
	display: inline-block;
	line-height: 100%;
	padding: 16px;
}

body .comment-container .review-comment-header>span,
body .comment-container .review-comment-header>a,
body .merged .merged-message>a {
	margin-right: 6px;
}

body .commit .commit-message>a {
	margin-right: 3px;
}

body .comment-container .review-comment-container .pending-label,
body .resolved-container .outdatedLabel {
	background: var(--vscode-badge-background);
	color: var(--vscode-badge-foreground);
	font-size: 11px;
	font-weight: 600;
	border-radius: 20px;
	padding: 4px 8px;
	margin-left: 6px;
}

body .resolved-container .unresolvedLabel {
	font-style: italic;
	margin-left: 5px;
}

body .diff .diffPath {
	margin-right: 4px;
}

.comment-container form,
#merge-comment-form {
	padding: 16px;
	background-color: var(--vscode-editorWidget-background);
}

body .comment-container .comment-body,
.review-body {
	padding: 16px;
	border-top: none;
}

body .comment-container .review-comment-container .review-comment-body {
	display: flex;
	flex-direction: column;
	gap: 16px;
	border: none;
}

body .comment-container .comment-body>p,
body .comment-container .comment-body>div>p,
.comment-container .review-body>p {
	margin-top: 0;
	line-height: 1.5em;
}

body .comment-container .comment-body>p:last-child,
body .comment-container .comment-body>div>p:last-child,
.comment-container .review-body>p:last-child {
	margin-bottom: 0;
}

body {
	margin: auto;
	width: 100%;
	max-width: 1280px;
	padding: 0 32px;
	box-sizing: border-box;
}

body .hidden-focusable {
	height: 0 !important;
	overflow: hidden;
}

.comment-actions button:hover:enabled,
.comment-actions button:focus:enabled {
	background-color: transparent;
}

body button.checkedOut {
	color: var(--vscode-foreground);
	opacity: 1 !important;
	background-color: transparent;
}

body button .icon {
	width: 16px;
	height: 16px;
}

.prIcon {
	display: flex;
	border-radius: 10px;
	margin-right: 5px;
	margin-top: 18px;
}

.overview-title {
	display: flex;
	align-items: center;
}

.overview-title h2 {
	font-size: 32px;
	margin-right: 6px;
}

.overview-title textarea {
	min-height: 50px;
}

.title-container {
	width: 100%;
}

.subtitle {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	row-gap: 12px;
}

.subtitle .avatar,
.subtitle .avatar-icon svg {
	margin-right: 6px;
}

.subtitle .author {
	display: flex;
	align-items: center;
}

.merge-branches {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	flex-wrap: wrap;
}

.branch-tag {
	margin-top: 3px;
	padding: 2px 4px;
	background: var(--vscode-editorInlayHint-background);
	color: var(--vscode-editorInlayHint-foreground);
	border-radius: 4px;
}

.subtitle .created-at {
	margin-left: auto;
	white-space: nowrap;
}

.button-group {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	align-items: flex-start;
}

small-button {
	display: flex;
	font-size: 11px;
	padding: 0 5px;
}

.header-actions {
	display: flex;
	gap: 8px;
	padding-top: 4px;
}

.header-actions>div:first-of-type {
	flex: 1;
}

:not(.status-item)>.small-button {
	font-weight: 600;
}

#status {
	box-sizing: border-box;
	line-height: 18px;
	color: var(--vscode-button-foreground);
	border-radius: 18px;
	padding: 4px 12px;
	margin-right: 10px;
	font-weight: 600;
	display: flex;
	gap: 4px;
}

#status svg path {
	fill: var(--vscode-button-foreground);
}

.vscode-high-contrast #status {
	border: 1px solid var(--vscode-contrastBorder);
	background-color: var(--vscode-badge-background);
	color: var(--vscode-badge-foreground);
}

.vscode-high-contrast #status svg path {
	fill: var(--vscode-badge-foreground);
}

.status-badge-merged {
	background-color: var(--vscode-pullRequests-merged);
}

.status-badge-open {
	background-color: var(--vscode-pullRequests-open);
}

.status-badge-closed {
	background-color: var(--vscode-pullRequests-closed);
}

.status-badge-draft {
	background-color: var(--vscode-pullRequests-draft);
}

.section {
	padding-bottom: 16px;
	border-bottom: 1px solid var(--vscode-editorWidget-border);
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.section:last-of-type {
	padding-bottom: 0px;
	border-bottom: none;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.section-header.clickable {
	cursor: pointer;
}

.section-header .section-title {
	font-weight: 600;
}

.section-placeholder {
	color: var(--vscode-descriptionForeground);
}

.assign-yourself:hover {
	cursor: pointer;
}

.section svg {
	width: 16px;
	height: 16px;
	display: block;
	margin-right: 0;
}

.section .icon-button,
.section .icon-button .icon {
	color: currentColor;
}

.icon-button-group {
	display: flex;
	flex-direction: row;
}

.section svg path {
	fill: currentColor;
}

.commit svg {
	width: 16px;
	height: auto;
	margin-right: 8px;
	flex-shrink: 0;
}

.comment-container.commit {
	border: none;
	padding: 4px 16px;
}

.comment-container.commit,
.comment-container.merged {
	box-sizing: border-box;
}

.commit,
.review,
.merged {
	display: flex;
	width: 100%;
	border: none;
	color: var(--vscode-foreground);
}

.review {
	margin: 0px 8px;
	padding: 4px 0;
}

.commit .commit-message,
.commit .timeline-with-detail,
.merged .merged-message {
	align-items: center;
	overflow: hidden;
	flex-grow: 1;
}

.commit .commit-message,
.merged .merged-message {
	display: flex;
}

.commit .timeline-with-detail {
	display: block;
}

.commit-message-detail {
	margin-left: 20px;
}

.commit .commit-message .avatar-container,
.merged .merged-message .avatar-container {
	margin-right: 4px;
	flex-shrink: 0;
}

.commit-message .icon {
	padding-top: 2px;
}

.commit .avatar-container .avatar,
.commit .avatar-container .avatar-icon,
.commit .avatar-container .avatar-icon svg,
.merged .avatar-container .avatar,
.merged .avatar-container .avatar-icon,
.merged .avatar-container .avatar-icon svg {
	width: 18px;
	height: 18px;
}

.message-container {
	display: inline-grid;
}

.commit .commit-message .message,
.merged .merged-message .message {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.commit .commit-message a.message {
	cursor: pointer;
}

.timeline-detail {
	display: flex;
	align-items: center;
	gap: 8px;
}

.commit .sha {
	min-width: 50px;
	font-family: var(--vscode-editor-font-family);
	margin-bottom: -2px;
	cursor: pointer;
}

.merged .merged-message .message,
.merged .inline-sha {
	margin: 0 4px 0 0;
}

.merged svg {
	width: 14px;
	height: auto;
	margin-right: 8px;
	flex-shrink: 0;
}

.details {
	display: flex;
	flex-direction: column;
	gap: 12px;
	width: 100%;
}

#description .comment-container {
	padding-top: 0px;
}

.comment-container {
	position: relative;
	width: 100%;
	display: flex;
	margin: 0;
	align-items: center;
	border-radius: 4px;
	border: 1px solid var(--vscode-editorHoverWidget-border);
}

.comment-container[data-type='commit'] {
	padding: 8px 0;
	border: none;
}

.comment-container[data-type='commit']+.comment-container[data-type='commit'] {
	border-top: none;
}

.comment-body .review-comment {
	box-sizing: border-box;
	border-top: 1px solid var(--vscode-editorHoverWidget-border);
}

.resolve-comment-row {
	display: flex;
	align-items: center;
	padding: 16px;
	background-color: var(--vscode-editorHoverWidget-background);
	border-top: 1px solid var(--vscode-editorHoverWidget-border);
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
}

.review-comment-container .review-comment .review-comment-header {
	padding: 16px 16px 8px 16px;
	border: none;
	background: none;
}

.review-comment-container .review-comment .comment-body {
	border: none;
	padding: 0px 16px 8px 16px;
}

.review-comment-container .review-comment .comment-body:last-of-type {
	padding: 0px 16px 16px 16px;
}

.comment-body .line {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 8px;
}

body .comment-form {
	padding: 20px 0 10px;
}

.review-comment-container .comment-form {
	margin: 0 0 0 36px;
	padding: 10px 0;
}

.task-list-item {
	list-style-type: none;
}

#status-checks textarea {
	margin-top: 10px;
}

textarea {
	min-height: 100px;
	max-height: 500px;
}

.editing-form {
	padding: 5px 0;
	display: flex;
	flex-direction: row;
	min-width: 300px;
}

.editing-form .form-actions {
	display: flex;
	gap: 8px;
	justify-content: flex-end;
}

.comment-form .form-actions>button,
.comment-form .form-actions>input[type='submit'] {
	margin-right: 0;
	margin-left: 0;
}

.primary-split-button {
	flex-grow: unset;
}

:not(.button-group) .dropdown-container {
	justify-content: right;
}

:not(.title-editing-form)>.form-actions {
	justify-content: flex-end;
	padding-top: 10px;
}

#rebase-actions {
	flex-direction: row-reverse;
}

.main-comment-form>.form-actions {
	margin-bottom: 10px;
}

.details .comment-body {
	padding: 19px 0;
}

blockquote {
	display: block;
	flex-direction: column;
	margin: 8px 0;
	padding: 8px 12px;
	border-left-width: 5px;
	border-left-style: solid;
}

blockquote p {
	margin: 8px 0;
}

blockquote p:first-child {
	margin-top: 0;
}

blockquote p:last-child {
	margin-bottom: 0;
}

.comment-body a:focus,
.comment-body input:focus,
.comment-body select:focus,
.comment-body textarea:focus {
	outline-offset: -1px;
}

.comment-body hr {
	border: 0;
	height: 2px;
	border-bottom: 2px solid;
}

.comment-body h1 {
	padding-bottom: 0.3em;
	line-height: 1.2;
	border-bottom-width: 1px;
	border-bottom-style: solid;
}

.comment-body h1,
h2,
h3 {
	font-weight: normal;
}

.comment-body h1 code,
.comment-body h2 code,
.comment-body h3 code,
.comment-body h4 code,
.comment-body h5 code,
.comment-body h6 code {
	font-size: inherit;
	line-height: auto;
}

.comment-body table {
	border-collapse: collapse;
}

.comment-body table>thead>tr>th {
	text-align: left;
	border-bottom: 1px solid;
}

.comment-body table>thead>tr>th,
.comment-body table>thead>tr>td,
.comment-body table>tbody>tr>th,
.comment-body table>tbody>tr>td {
	padding: 5px 10px;
}

.comment-body table>tbody>tr+tr>td {
	border-top: 1px solid;
}

code {
	font-family: var(--vscode-editor-font-family), Menlo, Monaco, Consolas, 'Droid Sans Mono', 'Courier New', monospace, 'Droid Sans Fallback';
}

.comment-body .snippet-clipboard-content {
	display: grid;
}

.comment-body video {
	width: 100%;
	border: 1px solid var(--vscode-editorWidget-border);
	border-radius: 4px;
}

.comment-body summary {
	margin-bottom: 8px;
}

.comment-body details summary::marker {
	display: flex;
}

.comment-body details summary svg {
	margin-left: 8px;
}

.comment-body body.wordWrap pre {
	white-space: pre-wrap;
}

.comment-body .mac code {
	font-size: 12px;
	line-height: 18px;
}

.comment-body pre:not(.hljs),
.comment-body pre.hljs code>div {
	padding: 16px;
	border-radius: 3px;
	overflow: auto;
}

.timestamp,
.timestamp:hover {
	color: var(--vscode-descriptionForeground);
	white-space: nowrap;
}

.timestamp {
	overflow: hidden;
	text-overflow: ellipsis;
	padding-left: 8px;
}

/** Theming */

.comment-body pre code {
	color: var(--vscode-editor-foreground);
}

.vscode-light .comment-body pre:not(.hljs),
.vscode-light .comment-body code>div {
	background-color: rgba(220, 220, 220, 0.4);
}

.vscode-dark .comment-body pre:not(.hljs),
.vscode-dark .comment-body code>div {
	background-color: rgba(10, 10, 10, 0.4);
}

.vscode-high-contrast .comment-body pre:not(.hljs),
.vscode-high-contrast .comment-body code>div {
	background-color: var(--vscode-editor-background);
	border: 1px solid var(--vscode-panel-border);
}

.vscode-high-contrast .comment-body h1 {
	border: 1px solid rgb(0, 0, 0);
}

.vscode-high-contrast .comment-container .review-comment-header,
.vscode-high-contrast #status-checks {
	background: none;
	border: 1px solid var(--vscode-panel-border);
}

.vscode-high-contrast .comment-container .comment-body,
.vscode-high-contrast .review-comment-container .review-body {
	border: 1px solid var(--vscode-panel-border);
}

.vscode-light .comment-body table>thead>tr>th {
	border-color: rgba(0, 0, 0, 0.69);
}

.vscode-dark .comment-body table>thead>tr>th {
	border-color: rgba(255, 255, 255, 0.69);
}

.vscode-light .comment-body h1,
.vscode-light .comment-body hr,
.vscode-light .comment-body table>tbody>tr+tr>td {
	border-color: rgba(0, 0, 0, 0.18);
}

.vscode-dark .comment-body h1,
.vscode-dark .comment-body hr,
.vscode-dark .comment-body table>tbody>tr+tr>td {
	border-color: rgba(255, 255, 255, 0.18);
}

.review-comment-body .diff-container {
	border-radius: 4px;
	border: 1px solid var(--vscode-editorHoverWidget-border);
}

.review-comment-body .diff-container .review-comment-container .comment-container {
	padding-top: 0;
}

.review-comment-body .diff-container .comment-container {
	border: none;
}

.review-comment-body .diff-container .review-comment-container .review-comment-header .avatar-container {
	margin-right: 4px;
}

.review-comment-body .diff-container .review-comment-container .review-comment-header .avatar {
	width: 18px;
	height: 18px;
}

.review-comment-body .diff-container .diff {
	border-top: 1px solid var(--vscode-editorWidget-border);
	overflow: scroll;
}

.resolved-container {
	padding: 6px 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: var(--vscode-editorWidget-background);
	border-top-left-radius: 3px;
	border-top-right-radius: 3px;
}

.resolved-container .diffPath:hover {
	text-decoration: underline;
	color: var(--vscode-textLink-activeForeground);
	cursor: pointer;
}

.diff .diffLine {
	display: flex;
	font-size: 12px;
	line-height: 20px;
}

.win32 .diff .diffLine {
	font-family: var(--vscode-editor-font-family), Consolas, Inconsolata, 'Courier New', monospace;
}

.darwin .diff .diffLine {
	font-family: var(--vscode-editor-font-family), Monaco, Menlo, Inconsolata, 'Courier New', monospace;
}

.linux .diff .diffLine {
	font-family: var(--vscode-editor-font-family), 'Droid Sans Mono', Inconsolata, 'Courier New', monospace, 'Droid Sans Fallback';
}

.diff .diffLine.add {
	background-color: var(--vscode-diffEditor-insertedTextBackground);
}

.diff .diffLine.delete {
	background-color: var(--vscode-diffEditor-removedTextBackground);
}

.diff .diffLine .diffTypeSign {
	user-select: none;
	padding-right: 5px;
}

.diff .diffLine .lineNumber {
	width: 1%;
	min-width: 50px;
	padding-right: 10px;
	padding-left: 10px;
	font-size: 12px;
	line-height: 20px;
	text-align: right;
	white-space: nowrap;
	box-sizing: border-box;
	display: block;
	user-select: none;
	font-family: var(--vscode-editor-font-family);
}

.github-checkbox {
	pointer-events: none;
}

.github-checkbox input {
	color: rgb(84, 84, 84);
	opacity: 0.6;
}

/* High Contrast Mode */

.vscode-high-contrast a:focus {
	outline-color: var(--vscode-contrastActiveBorder);
}

.vscode-high-contrast .title {
	border-bottom: 1px solid var(--vscode-contrastBorder);
}

.vscode-high-contrast .diff .diffLine {
	background: none;
}

.vscode-high-contrast .resolved-container {
	background: none;
}

.vscode-high-contrast .diff-container {
	border: 1px solid var(--vscode-contrastBorder);
}

.vscode-high-contrast .diff .diffLine.add {
	border: 1px dashed var(--vscode-diffEditor-insertedTextBorder);
}

.vscode-high-contrast .diff .diffLine.delete {
	border: 1px dashed var(--vscode-diffEditor-removedTextBorder);
}

@media (max-width: 768px) {
	.title {
		border-bottom: none;
		padding-bottom: 0px;
	}

	#app {
		display: block;
	}

	#sidebar {
		display: grid;
		column-gap: 20px;
		row-gap: 12px;
		grid-template-columns: calc(50% - 10px) calc(50% - 10px);
		padding: 0;
	}

	.section-content {
		display: flex;
		flex-wrap: wrap;
	}

	.section-item {
		display: flex;
	}

	body .hidden-focusable {
		height: initial;
		overflow: initial;
	}

	.section-header button {
		display: flex;
	}

	.section-item .login {
		width: auto;
		margin-right: 4px;
	}

	/* Hides bottom borders on bottom two sections */
	.section:nth-last-child(-n + 2) {
		border-bottom: none;
	}
}

.icon {
	width: 16px;
	height: 16px;
	font-size: 16px;
	display: flex;
}

.icon.copilot-icon {
	margin-right: 6px;
}

.action-bar {
	position: absolute;
	display: flex;
	justify-content: space-between;
	z-index: 100;
	top: 9px;
	right: 9px;
}

.flex-action-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	z-index: 100;
	margin-left: 9px;
	min-width: 42px;
}

.action-bar>button,
.flex-action-bar>button {
	margin-left: 4px;
	margin-right: 4px;
}

.title-editing-form {
	flex-grow: 1;
}

.title-editing-form>.form-actions {
	margin-left: 8px;
}

/* permalinks */
.comment-body .Box p {
	margin-block-start: 0px;
	margin-block-end: 0px;
}

.comment-body .Box {
	border-radius: 4px;
	border-style: solid;
	border-width: 1px;
	border-color: var(--vscode-editorHoverWidget-border);
}

.comment-body .Box-header {
	background-color: var(--vscode-editorWidget-background);
	color: var(--vscode-disabledForeground);
	border-bottom-style: solid;
	border-bottom-width: 1px;
	padding: 8px 16px;
	border-bottom-color: var(--vscode-editorHoverWidget-border);
	border-top-left-radius: 3px;
	border-top-right-radius: 3px;
}

.comment-body .blob-num {
	word-wrap: break-word;
	box-sizing: border-box;
	border: 0 !important;
	padding-top: 0 !important;
	padding-bottom: 0 !important;
	min-width: 50px;
	font-family: var(--vscode-editor-font-family);
	font-size: 12px;
	color: var(--vscode-editorLineNumber-foreground);
	line-height: 20px;
	text-align: right;
	white-space: nowrap;
	vertical-align: top;
	cursor: pointer;
	user-select: none;
}

.comment-body .blob-num::before {
	content: attr(data-line-number);
}

.comment-body .blob-code-inner {
	tab-size: 8;
	border: 0 !important;
	padding-top: 0 !important;
	padding-bottom: 0 !important;
	line-height: 20px;
	vertical-align: top;
	display: table-cell;
	overflow: visible;
	font-family: var(--vscode-editor-font-family);
	font-size: 12px;
	word-wrap: anywhere;
	text-indent: 0;
	white-space: pre-wrap;
}

.comment-body .commit-tease-sha {
	font-family: var(--vscode-editor-font-family);
	font-size: 12px;
}

/* Suggestion */
.comment-body .blob-wrapper.data.file .d-table {
	border-radius: 4px;
	border-style: solid;
	border-width: 1px;
	border-collapse: unset;
	border-color: var(--vscode-editorHoverWidget-border);
}

.comment-body .js-suggested-changes-blob {
	border-collapse: collapse;
}

.blob-code-deletion,
.blob-num-deletion {
	border-collapse: collapse;
	background-color: var(--vscode-diffEditor-removedLineBackground);
}

.blob-code-addition,
.blob-num-addition {
	border-collapse: collapse;
	background-color: var(--vscode-diffEditor-insertedLineBackground);
}

.blob-code-marker-addition::before {
	content: "+ ";
}

.blob-code-marker-deletion::before {
	content: "- ";
}

.markdown-alert.markdown-alert-warning {
	border-left: .25em solid var(--vscode-editorWarning-foreground);
}

.markdown-alert.markdown-alert-warning .markdown-alert-title {
	color: var(--vscode-editorWarning-foreground);
}

.markdown-alert.markdown-alert-note {
	border-left: .25em solid var(--vscode-editorInfo-foreground);
}

.markdown-alert.markdown-alert-note .markdown-alert-title {
	color: var(--vscode-editorInfo-foreground);
}

.markdown-alert.markdown-alert-tip {
	border-left: .25em solid var(--vscode-testing-iconPassed);
}

.markdown-alert.markdown-alert-tip .markdown-alert-title {
	color: var(--vscode-testing-iconPassed);
}

.markdown-alert.markdown-alert-important {
	border-left: .25em solid var(--vscode-statusBar-debuggingBackground);
}

.markdown-alert.markdown-alert-important .markdown-alert-title {
	color: var(--vscode-statusBar-debuggingBackground);
}

.markdown-alert.markdown-alert-caution {
	border-left: .25em solid var(--vscode-editorError-foreground);
}

.markdown-alert.markdown-alert-caution .markdown-alert-title {
	color: var(--vscode-editorError-foreground);
}

.markdown-alert {
	padding: .5rem .5rem;
	margin-bottom: 1rem;
	color: inherit;
}

.markdown-alert .markdown-alert-title {
	display: flex;
	align-items: center;
	line-height: 1;
}

.markdown-alert-title svg {
	padding-right: 3px;
}

.markdown-alert>:first-child {
	margin-top: 0;
}

svg.octicon path {
	display: inline-block;
	overflow: visible !important;
	vertical-align: text-bottom;
	fill: currentColor;
}

.collapsible-sidebar {
	border-top: 1px solid var(--vscode-editorWidget-border);
	border-bottom: 1px solid var(--vscode-editorWidget-border);
	margin-bottom: 24px;
}

.collapsible-sidebar-header {
	display: flex;
	align-items: center;
	cursor: pointer;
	padding: 16px 0px 8px;
	user-select: none;
	outline: none;
}

.collapsible-sidebar-header.expanded {
	padding: 8px 0px;
}

.collapsible-sidebar-header:focus {
	outline: 1px solid var(--vscode-focusBorder);
}

.collapsible-sidebar-title {
	font-size: 13px;
	width: 100%;
}

.collapsible-sidebar-content {
	padding-bottom: 16px;
}

.collapsed-label {
	gap: 8px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 8px 20px;
}

.collapsed-section {
	gap: 8px;
	display: inline-flex;
	align-items: center;
	min-width: 0;
	overflow: hidden;
	height: 22px;
}

.collapsed-section-label {
	padding-right: 4px;
	font-weight: 600;
	flex-shrink: 0;
}

.collapsed-section-count {
	color: var(--vscode-descriptionForeground);
}

.pill-container {
	display: flex;
	align-items: center;
	min-width: 0;
	flex: 1;
	flex-wrap: nowrap;
	overflow: hidden;
}

.pill-item {
	flex-shrink: 0;
	white-space: nowrap;
	border-radius: 20px;
	margin-right: 2px;
	border-style: none;
	text-overflow: ellipsis;
	max-width: -webkit-fill-available;
	overflow: hidden;
	display: inline-block;
}

.pill-overflow {
	color: var(--vscode-descriptionForeground);
	font-size: 13px;
	margin-left: 4px;
	flex-shrink: 0;
	white-space: nowrap;
}

.collapsed-section .stacked-avatar {
	position: absolute;
}

.avatar-stack {
	position: relative;
	height: 22px;
}

.collapsible-label-see-more {
	padding-bottom: 16px;
	display: block;
	font-size: 13px;
	cursor: pointer;
}`,""]);const A=h},6314:k=>{"use strict";k.exports=function(_){var j=[];return j.toString=i(function(){return this.map(function($){var T="",g=typeof $[5]!="undefined";return $[4]&&(T+="@supports (".concat($[4],") {")),$[2]&&(T+="@media ".concat($[2]," {")),g&&(T+="@layer".concat($[5].length>0?" ".concat($[5]):""," {")),T+=_($),g&&(T+="}"),$[2]&&(T+="}"),$[4]&&(T+="}"),T}).join("")},"toString"),j.i=i(function($,T,g,h,A){typeof $=="string"&&($=[[null,$,void 0]]);var I={};if(g)for(var z=0;z<this.length;z++){var V=this[z][0];V!=null&&(I[V]=!0)}for(var J=0;J<$.length;J++){var G=[].concat($[J]);g&&I[G[0]]||(typeof A!="undefined"&&(typeof G[5]=="undefined"||(G[1]="@layer".concat(G[5].length>0?" ".concat(G[5]):""," {").concat(G[1],"}")),G[5]=A),T&&(G[2]&&(G[1]="@media ".concat(G[2]," {").concat(G[1],"}")),G[2]=T),h&&(G[4]?(G[1]="@supports (".concat(G[4],") {").concat(G[1],"}"),G[4]=h):G[4]="".concat(h)),j.push(G))}},"i"),j}},1601:k=>{"use strict";k.exports=function(_){return _[1]}},4353:function(k){(function(_,j){k.exports=j()})(this,function(){"use strict";var _="millisecond",j="second",Y="minute",$="hour",T="day",g="week",h="month",A="quarter",I="year",z="date",V=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,J=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,G={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},De=i(function(q,D,H){var re=String(q);return!re||re.length>=D?q:""+Array(D+1-re.length).join(H)+q},"$"),Ve={s:De,z:i(function(q){var D=-q.utcOffset(),H=Math.abs(D),re=Math.floor(H/60),X=H%60;return(D<=0?"+":"-")+De(re,2,"0")+":"+De(X,2,"0")},"z"),m:i(function q(D,H){if(D.date()<H.date())return-q(H,D);var re=12*(H.year()-D.year())+(H.month()-D.month()),X=D.clone().add(re,h),ue=H-X<0,pe=D.clone().add(re+(ue?-1:1),h);return+(-(re+(H-X)/(ue?X-pe:pe-X))||0)},"t"),a:i(function(q){return q<0?Math.ceil(q)||0:Math.floor(q)},"a"),p:i(function(q){return{M:h,y:I,w:g,d:T,D:z,h:$,m:Y,s:j,ms:_,Q:A}[q]||String(q||"").toLowerCase().replace(/s$/,"")},"p"),u:i(function(q){return q===void 0},"u")},fe="en",Ae={};Ae[fe]=G;var rt=i(function(q){return q instanceof ie},"m"),U=i(function(q,D,H){var re;if(!q)return fe;if(typeof q=="string")Ae[q]&&(re=q),D&&(Ae[q]=D,re=q);else{var X=q.name;Ae[X]=q,re=X}return!H&&re&&(fe=re),re||!H&&fe},"D"),N=i(function(q,D){if(rt(q))return q.clone();var H=typeof D=="object"?D:{};return H.date=q,H.args=arguments,new ie(H)},"v"),l=Ve;l.l=U,l.i=rt,l.w=function(q,D){return N(q,{locale:D.$L,utc:D.$u,x:D.$x,$offset:D.$offset})};var ie=function(){function q(H){this.$L=U(H.locale,null,!0),this.parse(H)}i(q,"d");var D=q.prototype;return D.parse=function(H){this.$d=function(re){var X=re.date,ue=re.utc;if(X===null)return new Date(NaN);if(l.u(X))return new Date;if(X instanceof Date)return new Date(X);if(typeof X=="string"&&!/Z$/i.test(X)){var pe=X.match(V);if(pe){var he=pe[2]-1||0,ge=(pe[7]||"0").substring(0,3);return ue?new Date(Date.UTC(pe[1],he,pe[3]||1,pe[4]||0,pe[5]||0,pe[6]||0,ge)):new Date(pe[1],he,pe[3]||1,pe[4]||0,pe[5]||0,pe[6]||0,ge)}}return new Date(X)}(H),this.$x=H.x||{},this.init()},D.init=function(){var H=this.$d;this.$y=H.getFullYear(),this.$M=H.getMonth(),this.$D=H.getDate(),this.$W=H.getDay(),this.$H=H.getHours(),this.$m=H.getMinutes(),this.$s=H.getSeconds(),this.$ms=H.getMilliseconds()},D.$utils=function(){return l},D.isValid=function(){return this.$d.toString()!=="Invalid Date"},D.isSame=function(H,re){var X=N(H);return this.startOf(re)<=X&&X<=this.endOf(re)},D.isAfter=function(H,re){return N(H)<this.startOf(re)},D.isBefore=function(H,re){return this.endOf(re)<N(H)},D.$g=function(H,re,X){return l.u(H)?this[re]:this.set(X,H)},D.unix=function(){return Math.floor(this.valueOf()/1e3)},D.valueOf=function(){return this.$d.getTime()},D.startOf=function(H,re){var X=this,ue=!!l.u(re)||re,pe=l.p(H),he=i(function(ke,We){var B=l.w(X.$u?Date.UTC(X.$y,We,ke):new Date(X.$y,We,ke),X);return ue?B:B.endOf(T)},"$"),ge=i(function(ke,We){return l.w(X.toDate()[ke].apply(X.toDate("s"),(ue?[0,0,0,0]:[23,59,59,999]).slice(We)),X)},"l"),He=this.$W,ze=this.$M,oe=this.$D,Ke="set"+(this.$u?"UTC":"");switch(pe){case I:return ue?he(1,0):he(31,11);case h:return ue?he(1,ze):he(0,ze+1);case g:var ct=this.$locale().weekStart||0,yt=(He<ct?He+7:He)-ct;return he(ue?oe-yt:oe+(6-yt),ze);case T:case z:return ge(Ke+"Hours",0);case $:return ge(Ke+"Minutes",1);case Y:return ge(Ke+"Seconds",2);case j:return ge(Ke+"Milliseconds",3);default:return this.clone()}},D.endOf=function(H){return this.startOf(H,!1)},D.$set=function(H,re){var X,ue=l.p(H),pe="set"+(this.$u?"UTC":""),he=(X={},X[T]=pe+"Date",X[z]=pe+"Date",X[h]=pe+"Month",X[I]=pe+"FullYear",X[$]=pe+"Hours",X[Y]=pe+"Minutes",X[j]=pe+"Seconds",X[_]=pe+"Milliseconds",X)[ue],ge=ue===T?this.$D+(re-this.$W):re;if(ue===h||ue===I){var He=this.clone().set(z,1);He.$d[he](ge),He.init(),this.$d=He.set(z,Math.min(this.$D,He.daysInMonth())).$d}else he&&this.$d[he](ge);return this.init(),this},D.set=function(H,re){return this.clone().$set(H,re)},D.get=function(H){return this[l.p(H)]()},D.add=function(H,re){var X,ue=this;H=Number(H);var pe=l.p(re),he=i(function(ze){var oe=N(ue);return l.w(oe.date(oe.date()+Math.round(ze*H)),ue)},"d");if(pe===h)return this.set(h,this.$M+H);if(pe===I)return this.set(I,this.$y+H);if(pe===T)return he(1);if(pe===g)return he(7);var ge=(X={},X[Y]=6e4,X[$]=36e5,X[j]=1e3,X)[pe]||1,He=this.$d.getTime()+H*ge;return l.w(He,this)},D.subtract=function(H,re){return this.add(-1*H,re)},D.format=function(H){var re=this;if(!this.isValid())return"Invalid Date";var X=H||"YYYY-MM-DDTHH:mm:ssZ",ue=l.z(this),pe=this.$locale(),he=this.$H,ge=this.$m,He=this.$M,ze=pe.weekdays,oe=pe.months,Ke=i(function(We,B,K,ce){return We&&(We[B]||We(re,X))||K[B].substr(0,ce)},"h"),ct=i(function(We){return l.s(he%12||12,We,"0")},"d"),yt=pe.meridiem||function(We,B,K){var ce=We<12?"AM":"PM";return K?ce.toLowerCase():ce},ke={YY:String(this.$y).slice(-2),YYYY:this.$y,M:He+1,MM:l.s(He+1,2,"0"),MMM:Ke(pe.monthsShort,He,oe,3),MMMM:Ke(oe,He),D:this.$D,DD:l.s(this.$D,2,"0"),d:String(this.$W),dd:Ke(pe.weekdaysMin,this.$W,ze,2),ddd:Ke(pe.weekdaysShort,this.$W,ze,3),dddd:ze[this.$W],H:String(he),HH:l.s(he,2,"0"),h:ct(1),hh:ct(2),a:yt(he,ge,!0),A:yt(he,ge,!1),m:String(ge),mm:l.s(ge,2,"0"),s:String(this.$s),ss:l.s(this.$s,2,"0"),SSS:l.s(this.$ms,3,"0"),Z:ue};return X.replace(J,function(We,B){return B||ke[We]||ue.replace(":","")})},D.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},D.diff=function(H,re,X){var ue,pe=l.p(re),he=N(H),ge=6e4*(he.utcOffset()-this.utcOffset()),He=this-he,ze=l.m(this,he);return ze=(ue={},ue[I]=ze/12,ue[h]=ze,ue[A]=ze/3,ue[g]=(He-ge)/6048e5,ue[T]=(He-ge)/864e5,ue[$]=He/36e5,ue[Y]=He/6e4,ue[j]=He/1e3,ue)[pe]||He,X?ze:l.a(ze)},D.daysInMonth=function(){return this.endOf(h).$D},D.$locale=function(){return Ae[this.$L]},D.locale=function(H,re){if(!H)return this.$L;var X=this.clone(),ue=U(H,re,!0);return ue&&(X.$L=ue),X},D.clone=function(){return l.w(this.$d,this)},D.toDate=function(){return new Date(this.valueOf())},D.toJSON=function(){return this.isValid()?this.toISOString():null},D.toISOString=function(){return this.$d.toISOString()},D.toString=function(){return this.$d.toUTCString()},q}(),Z=ie.prototype;return N.prototype=Z,[["$ms",_],["$s",j],["$m",Y],["$H",$],["$W",T],["$M",h],["$y",I],["$D",z]].forEach(function(q){Z[q[1]]=function(D){return this.$g(D,q[0],q[1])}}),N.extend=function(q,D){return q.$i||(q(D,ie,N),q.$i=!0),N},N.locale=U,N.isDayjs=rt,N.unix=function(q){return N(1e3*q)},N.en=Ae[fe],N.Ls=Ae,N.p={},N})},8660:function(k){(function(_,j){k.exports=j()})(this,function(){"use strict";return function(_,j,Y){_=_||{};var $=j.prototype,T={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function g(A,I,z,V){return $.fromToBase(A,I,z,V)}i(g,"i"),Y.en.relativeTime=T,$.fromToBase=function(A,I,z,V,J){for(var G,De,Ve,fe=z.$locale().relativeTime||T,Ae=_.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],rt=Ae.length,U=0;U<rt;U+=1){var N=Ae[U];N.d&&(G=V?Y(A).diff(z,N.d,!0):z.diff(A,N.d,!0));var l=(_.rounding||Math.round)(Math.abs(G));if(Ve=G>0,l<=N.r||!N.r){l<=1&&U>0&&(N=Ae[U-1]);var ie=fe[N.l];J&&(l=J(""+l)),De=typeof ie=="string"?ie.replace("%d",l):ie(l,I,N.l,Ve);break}}if(I)return De;var Z=Ve?fe.future:fe.past;return typeof Z=="function"?Z(De):Z.replace("%s",De)},$.to=function(A,I){return g(A,I,this,!0)},$.from=function(A,I){return g(A,I,this)};var h=i(function(A){return A.$u?Y.utc():Y()},"d");$.toNow=function(A){return this.to(h(this),A)},$.fromNow=function(A){return this.from(h(this),A)}}})},3581:function(k){(function(_,j){k.exports=j()})(this,function(){"use strict";return function(_,j,Y){Y.updateLocale=function($,T){var g=Y.Ls[$];if(g)return(T?Object.keys(T):[]).forEach(function(h){g[h]=T[h]}),g}}})},7334:k=>{function _(j,Y,$){var T,g,h,A,I;Y==null&&(Y=100);function z(){var J=Date.now()-A;J<Y&&J>=0?T=setTimeout(z,Y-J):(T=null,$||(I=j.apply(h,g),h=g=null))}i(z,"later");var V=i(function(){h=this,g=arguments,A=Date.now();var J=$&&!T;return T||(T=setTimeout(z,Y)),J&&(I=j.apply(h,g),h=g=null),I},"debounced");return V.clear=function(){T&&(clearTimeout(T),T=null)},V.flush=function(){T&&(I=j.apply(h,g),h=g=null,clearTimeout(T),T=null)},V}i(_,"debounce"),_.debounce=_,k.exports=_},7007:k=>{"use strict";var _=typeof Reflect=="object"?Reflect:null,j=_&&typeof _.apply=="function"?_.apply:i(function(N,l,ie){return Function.prototype.apply.call(N,l,ie)},"ReflectApply"),Y;_&&typeof _.ownKeys=="function"?Y=_.ownKeys:Object.getOwnPropertySymbols?Y=i(function(N){return Object.getOwnPropertyNames(N).concat(Object.getOwnPropertySymbols(N))},"ReflectOwnKeys"):Y=i(function(N){return Object.getOwnPropertyNames(N)},"ReflectOwnKeys");function $(U){console&&console.warn&&console.warn(U)}i($,"ProcessEmitWarning");var T=Number.isNaN||i(function(N){return N!==N},"NumberIsNaN");function g(){g.init.call(this)}i(g,"EventEmitter"),k.exports=g,k.exports.once=rt,g.EventEmitter=g,g.prototype._events=void 0,g.prototype._eventsCount=0,g.prototype._maxListeners=void 0;var h=10;function A(U){if(typeof U!="function")throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof U)}i(A,"checkListener"),Object.defineProperty(g,"defaultMaxListeners",{enumerable:!0,get:i(function(){return h},"get"),set:i(function(U){if(typeof U!="number"||U<0||T(U))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+U+".");h=U},"set")}),g.init=function(){(this._events===void 0||this._events===Object.getPrototypeOf(this)._events)&&(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},g.prototype.setMaxListeners=i(function(N){if(typeof N!="number"||N<0||T(N))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+N+".");return this._maxListeners=N,this},"setMaxListeners");function I(U){return U._maxListeners===void 0?g.defaultMaxListeners:U._maxListeners}i(I,"_getMaxListeners"),g.prototype.getMaxListeners=i(function(){return I(this)},"getMaxListeners"),g.prototype.emit=i(function(N){for(var l=[],ie=1;ie<arguments.length;ie++)l.push(arguments[ie]);var Z=N==="error",q=this._events;if(q!==void 0)Z=Z&&q.error===void 0;else if(!Z)return!1;if(Z){var D;if(l.length>0&&(D=l[0]),D instanceof Error)throw D;var H=new Error("Unhandled error."+(D?" ("+D.message+")":""));throw H.context=D,H}var re=q[N];if(re===void 0)return!1;if(typeof re=="function")j(re,this,l);else for(var X=re.length,ue=Ve(re,X),ie=0;ie<X;++ie)j(ue[ie],this,l);return!0},"emit");function z(U,N,l,ie){var Z,q,D;if(A(l),q=U._events,q===void 0?(q=U._events=Object.create(null),U._eventsCount=0):(q.newListener!==void 0&&(U.emit("newListener",N,l.listener?l.listener:l),q=U._events),D=q[N]),D===void 0)D=q[N]=l,++U._eventsCount;else if(typeof D=="function"?D=q[N]=ie?[l,D]:[D,l]:ie?D.unshift(l):D.push(l),Z=I(U),Z>0&&D.length>Z&&!D.warned){D.warned=!0;var H=new Error("Possible EventEmitter memory leak detected. "+D.length+" "+String(N)+" listeners added. Use emitter.setMaxListeners() to increase limit");H.name="MaxListenersExceededWarning",H.emitter=U,H.type=N,H.count=D.length,$(H)}return U}i(z,"_addListener"),g.prototype.addListener=i(function(N,l){return z(this,N,l,!1)},"addListener"),g.prototype.on=g.prototype.addListener,g.prototype.prependListener=i(function(N,l){return z(this,N,l,!0)},"prependListener");function V(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length===0?this.listener.call(this.target):this.listener.apply(this.target,arguments)}i(V,"onceWrapper");function J(U,N,l){var ie={fired:!1,wrapFn:void 0,target:U,type:N,listener:l},Z=V.bind(ie);return Z.listener=l,ie.wrapFn=Z,Z}i(J,"_onceWrap"),g.prototype.once=i(function(N,l){return A(l),this.on(N,J(this,N,l)),this},"once"),g.prototype.prependOnceListener=i(function(N,l){return A(l),this.prependListener(N,J(this,N,l)),this},"prependOnceListener"),g.prototype.removeListener=i(function(N,l){var ie,Z,q,D,H;if(A(l),Z=this._events,Z===void 0)return this;if(ie=Z[N],ie===void 0)return this;if(ie===l||ie.listener===l)--this._eventsCount===0?this._events=Object.create(null):(delete Z[N],Z.removeListener&&this.emit("removeListener",N,ie.listener||l));else if(typeof ie!="function"){for(q=-1,D=ie.length-1;D>=0;D--)if(ie[D]===l||ie[D].listener===l){H=ie[D].listener,q=D;break}if(q<0)return this;q===0?ie.shift():fe(ie,q),ie.length===1&&(Z[N]=ie[0]),Z.removeListener!==void 0&&this.emit("removeListener",N,H||l)}return this},"removeListener"),g.prototype.off=g.prototype.removeListener,g.prototype.removeAllListeners=i(function(N){var l,ie,Z;if(ie=this._events,ie===void 0)return this;if(ie.removeListener===void 0)return arguments.length===0?(this._events=Object.create(null),this._eventsCount=0):ie[N]!==void 0&&(--this._eventsCount===0?this._events=Object.create(null):delete ie[N]),this;if(arguments.length===0){var q=Object.keys(ie),D;for(Z=0;Z<q.length;++Z)D=q[Z],D!=="removeListener"&&this.removeAllListeners(D);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if(l=ie[N],typeof l=="function")this.removeListener(N,l);else if(l!==void 0)for(Z=l.length-1;Z>=0;Z--)this.removeListener(N,l[Z]);return this},"removeAllListeners");function G(U,N,l){var ie=U._events;if(ie===void 0)return[];var Z=ie[N];return Z===void 0?[]:typeof Z=="function"?l?[Z.listener||Z]:[Z]:l?Ae(Z):Ve(Z,Z.length)}i(G,"_listeners"),g.prototype.listeners=i(function(N){return G(this,N,!0)},"listeners"),g.prototype.rawListeners=i(function(N){return G(this,N,!1)},"rawListeners"),g.listenerCount=function(U,N){return typeof U.listenerCount=="function"?U.listenerCount(N):De.call(U,N)},g.prototype.listenerCount=De;function De(U){var N=this._events;if(N!==void 0){var l=N[U];if(typeof l=="function")return 1;if(l!==void 0)return l.length}return 0}i(De,"listenerCount"),g.prototype.eventNames=i(function(){return this._eventsCount>0?Y(this._events):[]},"eventNames");function Ve(U,N){for(var l=new Array(N),ie=0;ie<N;++ie)l[ie]=U[ie];return l}i(Ve,"arrayClone");function fe(U,N){for(;N+1<U.length;N++)U[N]=U[N+1];U.pop()}i(fe,"spliceOne");function Ae(U){for(var N=new Array(U.length),l=0;l<N.length;++l)N[l]=U[l].listener||U[l];return N}i(Ae,"unwrapListeners");function rt(U,N){return new Promise(function(l,ie){function Z(){q!==void 0&&U.removeListener("error",q),l([].slice.call(arguments))}i(Z,"eventListener");var q;N!=="error"&&(q=i(function(H){U.removeListener(N,Z),ie(H)},"errorListener"),U.once("error",q)),U.once(N,Z)})}i(rt,"once")},5228:k=>{"use strict";/*
object-assign
(c) Sindre Sorhus
@license MIT
*/var _=Object.getOwnPropertySymbols,j=Object.prototype.hasOwnProperty,Y=Object.prototype.propertyIsEnumerable;function $(g){if(g==null)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(g)}i($,"toObject");function T(){try{if(!Object.assign)return!1;var g=new String("abc");if(g[5]="de",Object.getOwnPropertyNames(g)[0]==="5")return!1;for(var h={},A=0;A<10;A++)h["_"+String.fromCharCode(A)]=A;var I=Object.getOwnPropertyNames(h).map(function(V){return h[V]});if(I.join("")!=="0123456789")return!1;var z={};return"abcdefghijklmnopqrst".split("").forEach(function(V){z[V]=V}),Object.keys(Object.assign({},z)).join("")==="abcdefghijklmnopqrst"}catch{return!1}}i(T,"shouldUseNative"),k.exports=T()?Object.assign:function(g,h){for(var A,I=$(g),z,V=1;V<arguments.length;V++){A=Object(arguments[V]);for(var J in A)j.call(A,J)&&(I[J]=A[J]);if(_){z=_(A);for(var G=0;G<z.length;G++)Y.call(A,z[G])&&(I[z[G]]=A[z[G]])}}return I}},7975:k=>{"use strict";function _(T){if(typeof T!="string")throw new TypeError("Path must be a string. Received "+JSON.stringify(T))}i(_,"assertPath");function j(T,g){for(var h="",A=0,I=-1,z=0,V,J=0;J<=T.length;++J){if(J<T.length)V=T.charCodeAt(J);else{if(V===47)break;V=47}if(V===47){if(!(I===J-1||z===1))if(I!==J-1&&z===2){if(h.length<2||A!==2||h.charCodeAt(h.length-1)!==46||h.charCodeAt(h.length-2)!==46){if(h.length>2){var G=h.lastIndexOf("/");if(G!==h.length-1){G===-1?(h="",A=0):(h=h.slice(0,G),A=h.length-1-h.lastIndexOf("/")),I=J,z=0;continue}}else if(h.length===2||h.length===1){h="",A=0,I=J,z=0;continue}}g&&(h.length>0?h+="/..":h="..",A=2)}else h.length>0?h+="/"+T.slice(I+1,J):h=T.slice(I+1,J),A=J-I-1;I=J,z=0}else V===46&&z!==-1?++z:z=-1}return h}i(j,"normalizeStringPosix");function Y(T,g){var h=g.dir||g.root,A=g.base||(g.name||"")+(g.ext||"");return h?h===g.root?h+A:h+T+A:A}i(Y,"_format");var $={resolve:i(function(){for(var g="",h=!1,A,I=arguments.length-1;I>=-1&&!h;I--){var z;I>=0?z=arguments[I]:(A===void 0&&(A=process.cwd()),z=A),_(z),z.length!==0&&(g=z+"/"+g,h=z.charCodeAt(0)===47)}return g=j(g,!h),h?g.length>0?"/"+g:"/":g.length>0?g:"."},"resolve"),normalize:i(function(g){if(_(g),g.length===0)return".";var h=g.charCodeAt(0)===47,A=g.charCodeAt(g.length-1)===47;return g=j(g,!h),g.length===0&&!h&&(g="."),g.length>0&&A&&(g+="/"),h?"/"+g:g},"normalize"),isAbsolute:i(function(g){return _(g),g.length>0&&g.charCodeAt(0)===47},"isAbsolute"),join:i(function(){if(arguments.length===0)return".";for(var g,h=0;h<arguments.length;++h){var A=arguments[h];_(A),A.length>0&&(g===void 0?g=A:g+="/"+A)}return g===void 0?".":$.normalize(g)},"join"),relative:i(function(g,h){if(_(g),_(h),g===h||(g=$.resolve(g),h=$.resolve(h),g===h))return"";for(var A=1;A<g.length&&g.charCodeAt(A)===47;++A);for(var I=g.length,z=I-A,V=1;V<h.length&&h.charCodeAt(V)===47;++V);for(var J=h.length,G=J-V,De=z<G?z:G,Ve=-1,fe=0;fe<=De;++fe){if(fe===De){if(G>De){if(h.charCodeAt(V+fe)===47)return h.slice(V+fe+1);if(fe===0)return h.slice(V+fe)}else z>De&&(g.charCodeAt(A+fe)===47?Ve=fe:fe===0&&(Ve=0));break}var Ae=g.charCodeAt(A+fe),rt=h.charCodeAt(V+fe);if(Ae!==rt)break;Ae===47&&(Ve=fe)}var U="";for(fe=A+Ve+1;fe<=I;++fe)(fe===I||g.charCodeAt(fe)===47)&&(U.length===0?U+="..":U+="/..");return U.length>0?U+h.slice(V+Ve):(V+=Ve,h.charCodeAt(V)===47&&++V,h.slice(V))},"relative"),_makeLong:i(function(g){return g},"_makeLong"),dirname:i(function(g){if(_(g),g.length===0)return".";for(var h=g.charCodeAt(0),A=h===47,I=-1,z=!0,V=g.length-1;V>=1;--V)if(h=g.charCodeAt(V),h===47){if(!z){I=V;break}}else z=!1;return I===-1?A?"/":".":A&&I===1?"//":g.slice(0,I)},"dirname"),basename:i(function(g,h){if(h!==void 0&&typeof h!="string")throw new TypeError('"ext" argument must be a string');_(g);var A=0,I=-1,z=!0,V;if(h!==void 0&&h.length>0&&h.length<=g.length){if(h.length===g.length&&h===g)return"";var J=h.length-1,G=-1;for(V=g.length-1;V>=0;--V){var De=g.charCodeAt(V);if(De===47){if(!z){A=V+1;break}}else G===-1&&(z=!1,G=V+1),J>=0&&(De===h.charCodeAt(J)?--J===-1&&(I=V):(J=-1,I=G))}return A===I?I=G:I===-1&&(I=g.length),g.slice(A,I)}else{for(V=g.length-1;V>=0;--V)if(g.charCodeAt(V)===47){if(!z){A=V+1;break}}else I===-1&&(z=!1,I=V+1);return I===-1?"":g.slice(A,I)}},"basename"),extname:i(function(g){_(g);for(var h=-1,A=0,I=-1,z=!0,V=0,J=g.length-1;J>=0;--J){var G=g.charCodeAt(J);if(G===47){if(!z){A=J+1;break}continue}I===-1&&(z=!1,I=J+1),G===46?h===-1?h=J:V!==1&&(V=1):h!==-1&&(V=-1)}return h===-1||I===-1||V===0||V===1&&h===I-1&&h===A+1?"":g.slice(h,I)},"extname"),format:i(function(g){if(g===null||typeof g!="object")throw new TypeError('The "pathObject" argument must be of type Object. Received type '+typeof g);return Y("/",g)},"format"),parse:i(function(g){_(g);var h={root:"",dir:"",base:"",ext:"",name:""};if(g.length===0)return h;var A=g.charCodeAt(0),I=A===47,z;I?(h.root="/",z=1):z=0;for(var V=-1,J=0,G=-1,De=!0,Ve=g.length-1,fe=0;Ve>=z;--Ve){if(A=g.charCodeAt(Ve),A===47){if(!De){J=Ve+1;break}continue}G===-1&&(De=!1,G=Ve+1),A===46?V===-1?V=Ve:fe!==1&&(fe=1):V!==-1&&(fe=-1)}return V===-1||G===-1||fe===0||fe===1&&V===G-1&&V===J+1?G!==-1&&(J===0&&I?h.base=h.name=g.slice(1,G):h.base=h.name=g.slice(J,G)):(J===0&&I?(h.name=g.slice(1,V),h.base=g.slice(1,G)):(h.name=g.slice(J,V),h.base=g.slice(J,G)),h.ext=g.slice(V,G)),J>0?h.dir=g.slice(0,J-1):I&&(h.dir="/"),h},"parse"),sep:"/",delimiter:":",win32:null,posix:null};$.posix=$,k.exports=$},2551:(k,_,j)=>{"use strict";var Y;/** @license React v16.14.0
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var $=j(6540),T=j(5228),g=j(9982);function h(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}if(i(h,"u"),!$)throw Error(h(227));function A(e,t,n,r,s,f,m,v,L){var S=Array.prototype.slice.call(arguments,3);try{t.apply(n,S)}catch(ne){this.onError(ne)}}i(A,"ba");var I=!1,z=null,V=!1,J=null,G={onError:i(function(e){I=!0,z=e},"onError")};function De(e,t,n,r,s,f,m,v,L){I=!1,z=null,A.apply(G,arguments)}i(De,"ja");function Ve(e,t,n,r,s,f,m,v,L){if(De.apply(this,arguments),I){if(I){var S=z;I=!1,z=null}else throw Error(h(198));V||(V=!0,J=S)}}i(Ve,"ka");var fe=null,Ae=null,rt=null;function U(e,t,n){var r=e.type||"unknown-event";e.currentTarget=rt(n),Ve(r,t,void 0,e),e.currentTarget=null}i(U,"oa");var N=null,l={};function ie(){if(N)for(var e in l){var t=l[e],n=N.indexOf(e);if(!(-1<n))throw Error(h(96,e));if(!q[n]){if(!t.extractEvents)throw Error(h(97,e));q[n]=t,n=t.eventTypes;for(var r in n){var s=void 0,f=n[r],m=t,v=r;if(D.hasOwnProperty(v))throw Error(h(99,v));D[v]=f;var L=f.phasedRegistrationNames;if(L){for(s in L)L.hasOwnProperty(s)&&Z(L[s],m,v);s=!0}else f.registrationName?(Z(f.registrationName,m,v),s=!0):s=!1;if(!s)throw Error(h(98,r,e))}}}}i(ie,"ra");function Z(e,t,n){if(H[e])throw Error(h(100,e));H[e]=t,re[e]=t.eventTypes[n].dependencies}i(Z,"ua");var q=[],D={},H={},re={};function X(e){var t=!1,n;for(n in e)if(e.hasOwnProperty(n)){var r=e[n];if(!l.hasOwnProperty(n)||l[n]!==r){if(l[n])throw Error(h(102,n));l[n]=r,t=!0}}t&&ie()}i(X,"xa");var ue=!(typeof window=="undefined"||typeof window.document=="undefined"||typeof window.document.createElement=="undefined"),pe=null,he=null,ge=null;function He(e){if(e=Ae(e)){if(typeof pe!="function")throw Error(h(280));var t=e.stateNode;t&&(t=fe(t),pe(e.stateNode,e.type,t))}}i(He,"Ca");function ze(e){he?ge?ge.push(e):ge=[e]:he=e}i(ze,"Da");function oe(){if(he){var e=he,t=ge;if(ge=he=null,He(e),t)for(e=0;e<t.length;e++)He(t[e])}}i(oe,"Ea");function Ke(e,t){return e(t)}i(Ke,"Fa");function ct(e,t,n,r,s){return e(t,n,r,s)}i(ct,"Ga");function yt(){}i(yt,"Ha");var ke=Ke,We=!1,B=!1;function K(){(he!==null||ge!==null)&&(yt(),oe())}i(K,"La");function ce(e,t,n){if(B)return e(t,n);B=!0;try{return ke(e,t,n)}finally{B=!1,K()}}i(ce,"Ma");var w=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,O=Object.prototype.hasOwnProperty,ve={},Te={};function _e(e){return O.call(Te,e)?!0:O.call(ve,e)?!1:w.test(e)?Te[e]=!0:(ve[e]=!0,!1)}i(_e,"Ra");function Be(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}i(Be,"Sa");function bt(e,t,n,r){if(t===null||typeof t=="undefined"||Be(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}i(bt,"Ta");function Me(e,t,n,r,s,f){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=s,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=f}i(Me,"v");var ye={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){ye[e]=new Me(e,0,!1,e,null,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];ye[t]=new Me(t,1,!1,e[1],null,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(e){ye[e]=new Me(e,2,!1,e.toLowerCase(),null,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){ye[e]=new Me(e,2,!1,e,null,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){ye[e]=new Me(e,3,!1,e.toLowerCase(),null,!1)}),["checked","multiple","muted","selected"].forEach(function(e){ye[e]=new Me(e,3,!0,e,null,!1)}),["capture","download"].forEach(function(e){ye[e]=new Me(e,4,!1,e,null,!1)}),["cols","rows","size","span"].forEach(function(e){ye[e]=new Me(e,6,!1,e,null,!1)}),["rowSpan","start"].forEach(function(e){ye[e]=new Me(e,5,!1,e.toLowerCase(),null,!1)});var Re=/[\-:]([a-z])/g;function oo(e){return e[1].toUpperCase()}i(oo,"Va"),"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Re,oo);ye[t]=new Me(t,1,!1,e,null,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Re,oo);ye[t]=new Me(t,1,!1,e,"http://www.w3.org/1999/xlink",!1)}),["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Re,oo);ye[t]=new Me(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1)}),["tabIndex","crossOrigin"].forEach(function(e){ye[e]=new Me(e,1,!1,e.toLowerCase(),null,!1)}),ye.xlinkHref=new Me("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0),["src","href","action","formAction"].forEach(function(e){ye[e]=new Me(e,1,!1,e.toLowerCase(),null,!0)});var _t=$.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;_t.hasOwnProperty("ReactCurrentDispatcher")||(_t.ReactCurrentDispatcher={current:null}),_t.hasOwnProperty("ReactCurrentBatchConfig")||(_t.ReactCurrentBatchConfig={suspense:null});function io(e,t,n,r){var s=ye.hasOwnProperty(t)?ye[t]:null,f=s!==null?s.type===0:r?!1:!(!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N");f||(bt(t,n,s,r)&&(n=null),r||s===null?_e(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):s.mustUseProperty?e[s.propertyName]=n===null?s.type===3?!1:"":n:(t=s.attributeName,r=s.attributeNamespace,n===null?e.removeAttribute(t):(s=s.type,n=s===3||s===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}i(io,"Xa");var ii=/^(.*)[\\\/]/,dt=typeof Symbol=="function"&&Symbol.for,be=dt?Symbol.for("react.element"):60103,Bn=dt?Symbol.for("react.portal"):60106,Qt=dt?Symbol.for("react.fragment"):60107,jn=dt?Symbol.for("react.strict_mode"):60108,Lr=dt?Symbol.for("react.profiler"):60114,li=dt?Symbol.for("react.provider"):60109,si=dt?Symbol.for("react.context"):60110,Vl=dt?Symbol.for("react.concurrent_mode"):60111,lo=dt?Symbol.for("react.forward_ref"):60112,Sr=dt?Symbol.for("react.suspense"):60113,so=dt?Symbol.for("react.suspense_list"):60120,ao=dt?Symbol.for("react.memo"):60115,Tr=dt?Symbol.for("react.lazy"):60116,$l=dt?Symbol.for("react.block"):60121,ai=typeof Symbol=="function"&&Symbol.iterator;function Un(e){return e===null||typeof e!="object"?null:(e=ai&&e[ai]||e["@@iterator"],typeof e=="function"?e:null)}i(Un,"nb");function zl(e){if(e._status===-1){e._status=0;var t=e._ctor;t=t(),e._result=t,t.then(function(n){e._status===0&&(n=n.default,e._status=1,e._result=n)},function(n){e._status===0&&(e._status=2,e._result=n)})}}i(zl,"ob");function At(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Qt:return"Fragment";case Bn:return"Portal";case Lr:return"Profiler";case jn:return"StrictMode";case Sr:return"Suspense";case so:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case si:return"Context.Consumer";case li:return"Context.Provider";case lo:var t=e.render;return t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case ao:return At(e.type);case $l:return At(e.render);case Tr:if(e=e._status===1?e._result:null)return At(e)}return null}i(At,"pb");function uo(e){var t="";do{e:switch(e.tag){case 3:case 4:case 6:case 7:case 10:case 9:var n="";break e;default:var r=e._debugOwner,s=e._debugSource,f=At(e.type);n=null,r&&(n=At(r.type)),r=f,f="",s?f=" (at "+s.fileName.replace(ii,"")+":"+s.lineNumber+")":n&&(f=" (created by "+n+")"),n=`
    in `+(r||"Unknown")+f}t+=n,e=e.return}while(e);return t}i(uo,"qb");function It(e){switch(typeof e){case"boolean":case"number":case"object":case"string":case"undefined":return e;default:return""}}i(It,"rb");function co(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}i(co,"sb");function ui(e){var t=co(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n!="undefined"&&typeof n.get=="function"&&typeof n.set=="function"){var s=n.get,f=n.set;return Object.defineProperty(e,t,{configurable:!0,get:i(function(){return s.call(this)},"get"),set:i(function(m){r=""+m,f.call(this,m)},"set")}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:i(function(){return r},"getValue"),setValue:i(function(m){r=""+m},"setValue"),stopTracking:i(function(){e._valueTracker=null,delete e[t]},"stopTracking")}}}i(ui,"tb");function St(e){e._valueTracker||(e._valueTracker=ui(e))}i(St,"xb");function ci(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=co(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}i(ci,"yb");function di(e,t){var n=t.checked;return T({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n!=null?n:e._wrapperState.initialChecked})}i(di,"zb");function Bl(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=It(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}i(Bl,"Ab");function jl(e,t){t=t.checked,t!=null&&io(e,"checked",t,!1)}i(jl,"Bb");function fi(e,t){jl(e,t);var n=It(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?mi(e,t.type,n):t.hasOwnProperty("defaultValue")&&mi(e,t.type,It(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}i(fi,"Cb");function Ul(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}i(Ul,"Eb");function mi(e,t,n){(t!=="number"||e.ownerDocument.activeElement!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}i(mi,"Db");function ba(e){var t="";return $.Children.forEach(e,function(n){n!=null&&(t+=n)}),t}i(ba,"Fb");function pi(e,t){return e=T({children:void 0},t),(t=ba(t.children))&&(e.children=t),e}i(pi,"Gb");function Wn(e,t,n,r){if(e=e.options,t){t={};for(var s=0;s<n.length;s++)t["$"+n[s]]=!0;for(n=0;n<e.length;n++)s=t.hasOwnProperty("$"+e[n].value),e[n].selected!==s&&(e[n].selected=s),s&&r&&(e[n].defaultSelected=!0)}else{for(n=""+It(n),t=null,s=0;s<e.length;s++){if(e[s].value===n){e[s].selected=!0,r&&(e[s].defaultSelected=!0);return}t!==null||e[s].disabled||(t=e[s])}t!==null&&(t.selected=!0)}}i(Wn,"Hb");function hi(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(h(91));return T({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}i(hi,"Ib");function vi(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(h(92));if(Array.isArray(n)){if(!(1>=n.length))throw Error(h(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:It(n)}}i(vi,"Jb");function gi(e,t){var n=It(t.value),r=It(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}i(gi,"Kb");function yi(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}i(yi,"Lb");var Ci={html:"http://www.w3.org/1999/xhtml",mathml:"http://www.w3.org/1998/Math/MathML",svg:"http://www.w3.org/2000/svg"};function wi(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}i(wi,"Nb");function fo(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?wi(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}i(fo,"Ob");var nn,xi=function(e){return typeof MSApp!="undefined"&&MSApp.execUnsafeLocalFunction?function(t,n,r,s){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,s)})}:e}(function(e,t){if(e.namespaceURI!==Ci.svg||"innerHTML"in e)e.innerHTML=t;else{for(nn=nn||document.createElement("div"),nn.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=nn.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function qn(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}i(qn,"Rb");function Mr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}i(Mr,"Sb");var Cn={animationend:Mr("Animation","AnimationEnd"),animationiteration:Mr("Animation","AnimationIteration"),animationstart:Mr("Animation","AnimationStart"),transitionend:Mr("Transition","TransitionEnd")},Zn={},lt={};ue&&(lt=document.createElement("div").style,"AnimationEvent"in window||(delete Cn.animationend.animation,delete Cn.animationiteration.animation,delete Cn.animationstart.animation),"TransitionEvent"in window||delete Cn.transitionend.transition);function Nr(e){if(Zn[e])return Zn[e];if(!Cn[e])return e;var t=Cn[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in lt)return Zn[e]=t[n];return e}i(Nr,"Wb");var Wl=Nr("animationend"),Ei=Nr("animationiteration"),Qn=Nr("animationstart"),bi=Nr("transitionend"),Kn="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),ki=new(typeof WeakMap=="function"?WeakMap:Map);function mo(e){var t=ki.get(e);return t===void 0&&(t=new Map,ki.set(e,t)),t}i(mo,"cc");function rn(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.effectTag&1026&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}i(rn,"dc");function _i(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}i(_i,"ec");function po(e){if(rn(e)!==e)throw Error(h(188))}i(po,"fc");function ql(e){var t=e.alternate;if(!t){if(t=rn(e),t===null)throw Error(h(188));return t!==e?null:e}for(var n=e,r=t;;){var s=n.return;if(s===null)break;var f=s.alternate;if(f===null){if(r=s.return,r!==null){n=r;continue}break}if(s.child===f.child){for(f=s.child;f;){if(f===n)return po(s),e;if(f===r)return po(s),t;f=f.sibling}throw Error(h(188))}if(n.return!==r.return)n=s,r=f;else{for(var m=!1,v=s.child;v;){if(v===n){m=!0,n=s,r=f;break}if(v===r){m=!0,r=s,n=f;break}v=v.sibling}if(!m){for(v=f.child;v;){if(v===n){m=!0,n=f,r=s;break}if(v===r){m=!0,r=f,n=s;break}v=v.sibling}if(!m)throw Error(h(189))}}if(n.alternate!==r)throw Error(h(190))}if(n.tag!==3)throw Error(h(188));return n.stateNode.current===n?e:t}i(ql,"gc");function Zl(e){if(e=ql(e),!e)return null;for(var t=e;;){if(t.tag===5||t.tag===6)return t;if(t.child)t.child.return=t,t=t.child;else{if(t===e)break;for(;!t.sibling;){if(!t.return||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}}return null}i(Zl,"hc");function on(e,t){if(t==null)throw Error(h(30));return e==null?t:Array.isArray(e)?Array.isArray(t)?(e.push.apply(e,t),e):(e.push(t),e):Array.isArray(t)?[e].concat(t):[e,t]}i(on,"ic");function Li(e,t,n){Array.isArray(e)?e.forEach(t,n):e&&t.call(n,e)}i(Li,"jc");var wn=null;function Ql(e){if(e){var t=e._dispatchListeners,n=e._dispatchInstances;if(Array.isArray(t))for(var r=0;r<t.length&&!e.isPropagationStopped();r++)U(e,t[r],n[r]);else t&&U(e,t,n);e._dispatchListeners=null,e._dispatchInstances=null,e.isPersistent()||e.constructor.release(e)}}i(Ql,"lc");function Rr(e){if(e!==null&&(wn=on(wn,e)),e=wn,wn=null,e){if(Li(e,Ql),wn)throw Error(h(95));if(V)throw e=J,V=!1,J=null,e}}i(Rr,"mc");function Je(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}i(Je,"nc");function Kl(e){if(!ue)return!1;e="on"+e;var t=e in document;return t||(t=document.createElement("div"),t.setAttribute(e,"return;"),t=typeof t[e]=="function"),t}i(Kl,"oc");var ho=[];function Yl(e){e.topLevelType=null,e.nativeEvent=null,e.targetInst=null,e.ancestors.length=0,10>ho.length&&ho.push(e)}i(Yl,"qc");function Gl(e,t,n,r){if(ho.length){var s=ho.pop();return s.topLevelType=e,s.eventSystemFlags=r,s.nativeEvent=t,s.targetInst=n,s}return{topLevelType:e,eventSystemFlags:r,nativeEvent:t,targetInst:n,ancestors:[]}}i(Gl,"rc");function Si(e){var t=e.targetInst,n=t;do{if(!n){e.ancestors.push(n);break}var r=n;if(r.tag===3)r=r.stateNode.containerInfo;else{for(;r.return;)r=r.return;r=r.tag!==3?null:r.stateNode.containerInfo}if(!r)break;t=n.tag,t!==5&&t!==6||e.ancestors.push(n),n=or(r)}while(n);for(n=0;n<e.ancestors.length;n++){t=e.ancestors[n];var s=Je(e.nativeEvent);r=e.topLevelType;var f=e.nativeEvent,m=e.eventSystemFlags;n===0&&(m|=64);for(var v=null,L=0;L<q.length;L++){var S=q[L];S&&(S=S.extractEvents(r,t,f,s,m))&&(v=on(v,S))}Rr(v)}}i(Si,"sc");function Ti(e,t,n){if(!n.has(e)){switch(e){case"scroll":st(t,"scroll",!0);break;case"focus":case"blur":st(t,"focus",!0),st(t,"blur",!0),n.set("blur",null),n.set("focus",null);break;case"cancel":case"close":Kl(e)&&st(t,e,!0);break;case"invalid":case"submit":case"reset":break;default:Kn.indexOf(e)===-1&&Ye(e,t)}n.set(e,null)}}i(Ti,"uc");var vo,Yn,Mi,go=!1,Bt=[],ln=null,sn=null,Tt=null,Ht=new Map,xn=new Map,En=[],yo="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput close cancel copy cut paste click change contextmenu reset submit".split(" "),Ni="focus blur dragenter dragleave mouseover mouseout pointerover pointerout gotpointercapture lostpointercapture".split(" ");function Xl(e,t){var n=mo(t);yo.forEach(function(r){Ti(r,t,n)}),Ni.forEach(function(r){Ti(r,t,n)})}i(Xl,"Jc");function Co(e,t,n,r,s){return{blockedOn:e,topLevelType:t,eventSystemFlags:n|32,nativeEvent:s,container:r}}i(Co,"Kc");function wo(e,t){switch(e){case"focus":case"blur":ln=null;break;case"dragenter":case"dragleave":sn=null;break;case"mouseover":case"mouseout":Tt=null;break;case"pointerover":case"pointerout":Ht.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":xn.delete(t.pointerId)}}i(wo,"Lc");function an(e,t,n,r,s,f){return e===null||e.nativeEvent!==f?(e=Co(t,n,r,s,f),t!==null&&(t=ir(t),t!==null&&Yn(t)),e):(e.eventSystemFlags|=r,e)}i(an,"Mc");function Ri(e,t,n,r,s){switch(t){case"focus":return ln=an(ln,e,t,n,r,s),!0;case"dragenter":return sn=an(sn,e,t,n,r,s),!0;case"mouseover":return Tt=an(Tt,e,t,n,r,s),!0;case"pointerover":var f=s.pointerId;return Ht.set(f,an(Ht.get(f)||null,e,t,n,r,s)),!0;case"gotpointercapture":return f=s.pointerId,xn.set(f,an(xn.get(f)||null,e,t,n,r,s)),!0}return!1}i(Ri,"Oc");function xo(e){var t=or(e.target);if(t!==null){var n=rn(t);if(n!==null){if(t=n.tag,t===13){if(t=_i(n),t!==null){e.blockedOn=t,g.unstable_runWithPriority(e.priority,function(){Mi(n)});return}}else if(t===3&&n.stateNode.hydrate){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}i(xo,"Pc");function Gn(e){if(e.blockedOn!==null)return!1;var t=kn(e.topLevelType,e.eventSystemFlags,e.container,e.nativeEvent);if(t!==null){var n=ir(t);return n!==null&&Yn(n),e.blockedOn=t,!1}return!0}i(Gn,"Qc");function Eo(e,t,n){Gn(e)&&n.delete(t)}i(Eo,"Sc");function bo(){for(go=!1;0<Bt.length;){var e=Bt[0];if(e.blockedOn!==null){e=ir(e.blockedOn),e!==null&&vo(e);break}var t=kn(e.topLevelType,e.eventSystemFlags,e.container,e.nativeEvent);t!==null?e.blockedOn=t:Bt.shift()}ln!==null&&Gn(ln)&&(ln=null),sn!==null&&Gn(sn)&&(sn=null),Tt!==null&&Gn(Tt)&&(Tt=null),Ht.forEach(Eo),xn.forEach(Eo)}i(bo,"Tc");function un(e,t){e.blockedOn===t&&(e.blockedOn=null,go||(go=!0,g.unstable_scheduleCallback(g.unstable_NormalPriority,bo)))}i(un,"Uc");function Xn(e){function t(s){return un(s,e)}if(i(t,"b"),0<Bt.length){un(Bt[0],e);for(var n=1;n<Bt.length;n++){var r=Bt[n];r.blockedOn===e&&(r.blockedOn=null)}}for(ln!==null&&un(ln,e),sn!==null&&un(sn,e),Tt!==null&&un(Tt,e),Ht.forEach(t),xn.forEach(t),n=0;n<En.length;n++)r=En[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<En.length&&(n=En[0],n.blockedOn===null);)xo(n),n.blockedOn===null&&En.shift()}i(Xn,"Vc");var Pi={},Pr=new Map,Oi=new Map,bn=["abort","abort",Wl,"animationEnd",Ei,"animationIteration",Qn,"animationStart","canplay","canPlay","canplaythrough","canPlayThrough","durationchange","durationChange","emptied","emptied","encrypted","encrypted","ended","ended","error","error","gotpointercapture","gotPointerCapture","load","load","loadeddata","loadedData","loadedmetadata","loadedMetadata","loadstart","loadStart","lostpointercapture","lostPointerCapture","playing","playing","progress","progress","seeking","seeking","stalled","stalled","suspend","suspend","timeupdate","timeUpdate",bi,"transitionEnd","waiting","waiting"];function Or(e,t){for(var n=0;n<e.length;n+=2){var r=e[n],s=e[n+1],f="on"+(s[0].toUpperCase()+s.slice(1));f={phasedRegistrationNames:{bubbled:f,captured:f+"Capture"},dependencies:[r],eventPriority:t},Oi.set(r,t),Pr.set(r,f),Pi[s]=f}}i(Or,"ad"),Or("blur blur cancel cancel click click close close contextmenu contextMenu copy copy cut cut auxclick auxClick dblclick doubleClick dragend dragEnd dragstart dragStart drop drop focus focus input input invalid invalid keydown keyDown keypress keyPress keyup keyUp mousedown mouseDown mouseup mouseUp paste paste pause pause play play pointercancel pointerCancel pointerdown pointerDown pointerup pointerUp ratechange rateChange reset reset seeked seeked submit submit touchcancel touchCancel touchend touchEnd touchstart touchStart volumechange volumeChange".split(" "),0),Or("drag drag dragenter dragEnter dragexit dragExit dragleave dragLeave dragover dragOver mousemove mouseMove mouseout mouseOut mouseover mouseOver pointermove pointerMove pointerout pointerOut pointerover pointerOver scroll scroll toggle toggle touchmove touchMove wheel wheel".split(" "),1),Or(bn,2);for(var Jl="change selectionchange textInput compositionstart compositionend compositionupdate".split(" "),Di=0;Di<Jl.length;Di++)Oi.set(Jl[Di],0);var ka=g.unstable_UserBlockingPriority,Mt=g.unstable_runWithPriority,ko=!0;function Ye(e,t){st(t,e,!1)}i(Ye,"F");function st(e,t,n){var r=Oi.get(t);switch(r===void 0?2:r){case 0:r=ht.bind(null,t,1,e);break;case 1:r=es.bind(null,t,1,e);break;default:r=cn.bind(null,t,1,e)}n?e.addEventListener(t,r,!0):e.addEventListener(t,r,!1)}i(st,"vc");function ht(e,t,n,r){We||yt();var s=cn,f=We;We=!0;try{ct(s,e,t,n,r)}finally{(We=f)||K()}}i(ht,"gd");function es(e,t,n,r){Mt(ka,cn.bind(null,e,t,n,r))}i(es,"hd");function cn(e,t,n,r){if(ko)if(0<Bt.length&&-1<yo.indexOf(e))e=Co(null,e,t,n,r),Bt.push(e);else{var s=kn(e,t,n,r);if(s===null)wo(e,r);else if(-1<yo.indexOf(e))e=Co(s,e,t,n,r),Bt.push(e);else if(!Ri(s,e,t,n,r)){wo(e,r),e=Gl(e,r,null,t);try{ce(Si,e)}finally{Yl(e)}}}}i(cn,"id");function kn(e,t,n,r){if(n=Je(r),n=or(n),n!==null){var s=rn(n);if(s===null)n=null;else{var f=s.tag;if(f===13){if(n=_i(s),n!==null)return n;n=null}else if(f===3){if(s.stateNode.hydrate)return s.tag===3?s.stateNode.containerInfo:null;n=null}else s!==n&&(n=null)}}e=Gl(e,r,n,t);try{ce(Si,e)}finally{Yl(e)}return null}i(kn,"Rc");var Jn={animationIterationCount:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},ts=["Webkit","ms","Moz","O"];Object.keys(Jn).forEach(function(e){ts.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Jn[t]=Jn[e]})});function Ai(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Jn.hasOwnProperty(e)&&Jn[e]?(""+t).trim():t+"px"}i(Ai,"ld");function _o(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,s=Ai(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,s):e[n]=s}}i(_o,"md");var ns=T({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Lo(e,t){if(t){if(ns[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(h(137,e,""));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(h(60));if(!(typeof t.dangerouslySetInnerHTML=="object"&&"__html"in t.dangerouslySetInnerHTML))throw Error(h(61))}if(t.style!=null&&typeof t.style!="object")throw Error(h(62,""))}}i(Lo,"od");function So(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}i(So,"pd");var Ii=Ci.html;function Ft(e,t){e=e.nodeType===9||e.nodeType===11?e:e.ownerDocument;var n=mo(e);t=re[t];for(var r=0;r<t.length;r++)Ti(t[r],e,n)}i(Ft,"rd");function er(){}i(er,"sd");function tr(e){if(e=e||(typeof document!="undefined"?document:void 0),typeof e=="undefined")return null;try{return e.activeElement||e.body}catch{return e.body}}i(tr,"td");function To(e){for(;e&&e.firstChild;)e=e.firstChild;return e}i(To,"ud");function rs(e,t){var n=To(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=To(n)}}i(rs,"vd");function Mo(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Mo(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}i(Mo,"wd");function Hi(){for(var e=window,t=tr();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=tr(e.document)}return t}i(Hi,"xd");function No(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}i(No,"yd");var os="$",Fi="/$",dn="$?",nr="$!",Ro=null,Po=null;function Vi(e,t){switch(e){case"button":case"input":case"select":case"textarea":return!!t.autoFocus}return!1}i(Vi,"Fd");function Oo(e,t){return e==="textarea"||e==="option"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}i(Oo,"Gd");var Do=typeof setTimeout=="function"?setTimeout:void 0,is=typeof clearTimeout=="function"?clearTimeout:void 0;function _n(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break}return e}i(_n,"Jd");function $i(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n===os||n===nr||n===dn){if(t===0)return e;t--}else n===Fi&&t++}e=e.previousSibling}return null}i($i,"Kd");var Ao=Math.random().toString(36).slice(2),jt="__reactInternalInstance$"+Ao,Dr="__reactEventHandlers$"+Ao,rr="__reactContainere$"+Ao;function or(e){var t=e[jt];if(t)return t;for(var n=e.parentNode;n;){if(t=n[rr]||n[jt]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=$i(e);e!==null;){if(n=e[jt])return n;e=$i(e)}return t}e=n,n=e.parentNode}return null}i(or,"tc");function ir(e){return e=e[jt]||e[rr],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}i(ir,"Nc");function Vt(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(h(33))}i(Vt,"Pd");function Io(e){return e[Dr]||null}i(Io,"Qd");function Ut(e){do e=e.return;while(e&&e.tag!==5);return e||null}i(Ut,"Rd");function zi(e,t){var n=e.stateNode;if(!n)return null;var r=fe(n);if(!r)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(h(231,t,typeof n));return n}i(zi,"Sd");function Bi(e,t,n){(t=zi(e,n.dispatchConfig.phasedRegistrationNames[t]))&&(n._dispatchListeners=on(n._dispatchListeners,t),n._dispatchInstances=on(n._dispatchInstances,e))}i(Bi,"Td");function ls(e){if(e&&e.dispatchConfig.phasedRegistrationNames){for(var t=e._targetInst,n=[];t;)n.push(t),t=Ut(t);for(t=n.length;0<t--;)Bi(n[t],"captured",e);for(t=0;t<n.length;t++)Bi(n[t],"bubbled",e)}}i(ls,"Ud");function ot(e,t,n){e&&n&&n.dispatchConfig.registrationName&&(t=zi(e,n.dispatchConfig.registrationName))&&(n._dispatchListeners=on(n._dispatchListeners,t),n._dispatchInstances=on(n._dispatchInstances,e))}i(ot,"Vd");function Ho(e){e&&e.dispatchConfig.registrationName&&ot(e._targetInst,null,e)}i(Ho,"Wd");function Ln(e){Li(e,ls)}i(Ln,"Xd");var Kt=null,Fo=null,Ar=null;function ji(){if(Ar)return Ar;var e,t=Fo,n=t.length,r,s="value"in Kt?Kt.value:Kt.textContent,f=s.length;for(e=0;e<n&&t[e]===s[e];e++);var m=n-e;for(r=1;r<=m&&t[n-r]===s[f-r];r++);return Ar=s.slice(e,1<r?1-r:void 0)}i(ji,"ae");function Ir(){return!0}i(Ir,"be");function Hr(){return!1}i(Hr,"ce");function kt(e,t,n,r){this.dispatchConfig=e,this._targetInst=t,this.nativeEvent=n,e=this.constructor.Interface;for(var s in e)e.hasOwnProperty(s)&&((t=e[s])?this[s]=t(n):s==="target"?this.target=r:this[s]=n[s]);return this.isDefaultPrevented=(n.defaultPrevented!=null?n.defaultPrevented:n.returnValue===!1)?Ir:Hr,this.isPropagationStopped=Hr,this}i(kt,"G"),T(kt.prototype,{preventDefault:i(function(){this.defaultPrevented=!0;var e=this.nativeEvent;e&&(e.preventDefault?e.preventDefault():typeof e.returnValue!="unknown"&&(e.returnValue=!1),this.isDefaultPrevented=Ir)},"preventDefault"),stopPropagation:i(function(){var e=this.nativeEvent;e&&(e.stopPropagation?e.stopPropagation():typeof e.cancelBubble!="unknown"&&(e.cancelBubble=!0),this.isPropagationStopped=Ir)},"stopPropagation"),persist:i(function(){this.isPersistent=Ir},"persist"),isPersistent:Hr,destructor:i(function(){var e=this.constructor.Interface,t;for(t in e)this[t]=null;this.nativeEvent=this._targetInst=this.dispatchConfig=null,this.isPropagationStopped=this.isDefaultPrevented=Hr,this._dispatchInstances=this._dispatchListeners=null},"destructor")}),kt.Interface={type:null,target:null,currentTarget:i(function(){return null},"currentTarget"),eventPhase:null,bubbles:null,cancelable:null,timeStamp:i(function(e){return e.timeStamp||Date.now()},"timeStamp"),defaultPrevented:null,isTrusted:null},kt.extend=function(e){function t(){}i(t,"b");function n(){return r.apply(this,arguments)}i(n,"c");var r=this;t.prototype=r.prototype;var s=new t;return T(s,n.prototype),n.prototype=s,n.prototype.constructor=n,n.Interface=T({},r.Interface,e),n.extend=r.extend,Ui(n),n},Ui(kt);function ss(e,t,n,r){if(this.eventPool.length){var s=this.eventPool.pop();return this.call(s,e,t,n,r),s}return new this(e,t,n,r)}i(ss,"ee");function as(e){if(!(e instanceof this))throw Error(h(279));e.destructor(),10>this.eventPool.length&&this.eventPool.push(e)}i(as,"fe");function Ui(e){e.eventPool=[],e.getPooled=ss,e.release=as}i(Ui,"de");var us=kt.extend({data:null}),cs=kt.extend({data:null}),ds=[9,13,27,32],Wi=ue&&"CompositionEvent"in window,lr=null;ue&&"documentMode"in document&&(lr=document.documentMode);var fs=ue&&"TextEvent"in window&&!lr,qi=ue&&(!Wi||lr&&8<lr&&11>=lr),Zi=" ",Wt={beforeInput:{phasedRegistrationNames:{bubbled:"onBeforeInput",captured:"onBeforeInputCapture"},dependencies:["compositionend","keypress","textInput","paste"]},compositionEnd:{phasedRegistrationNames:{bubbled:"onCompositionEnd",captured:"onCompositionEndCapture"},dependencies:"blur compositionend keydown keypress keyup mousedown".split(" ")},compositionStart:{phasedRegistrationNames:{bubbled:"onCompositionStart",captured:"onCompositionStartCapture"},dependencies:"blur compositionstart keydown keypress keyup mousedown".split(" ")},compositionUpdate:{phasedRegistrationNames:{bubbled:"onCompositionUpdate",captured:"onCompositionUpdateCapture"},dependencies:"blur compositionupdate keydown keypress keyup mousedown".split(" ")}},ms=!1;function Qi(e,t){switch(e){case"keyup":return ds.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"blur":return!0;default:return!1}}i(Qi,"qe");function Ki(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}i(Ki,"re");var Sn=!1;function ps(e,t){switch(e){case"compositionend":return Ki(t);case"keypress":return t.which!==32?null:(ms=!0,Zi);case"textInput":return e=t.data,e===Zi&&ms?null:e;default:return null}}i(ps,"te");function hs(e,t){if(Sn)return e==="compositionend"||!Wi&&Qi(e,t)?(e=ji(),Ar=Fo=Kt=null,Sn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return qi&&t.locale!=="ko"?null:t.data;default:return null}}i(hs,"ue");var Fr={eventTypes:Wt,extractEvents:i(function(e,t,n,r){var s;if(Wi)e:{switch(e){case"compositionstart":var f=Wt.compositionStart;break e;case"compositionend":f=Wt.compositionEnd;break e;case"compositionupdate":f=Wt.compositionUpdate;break e}f=void 0}else Sn?Qi(e,n)&&(f=Wt.compositionEnd):e==="keydown"&&n.keyCode===229&&(f=Wt.compositionStart);return f?(qi&&n.locale!=="ko"&&(Sn||f!==Wt.compositionStart?f===Wt.compositionEnd&&Sn&&(s=ji()):(Kt=r,Fo="value"in Kt?Kt.value:Kt.textContent,Sn=!0)),f=us.getPooled(f,t,n,r),s?f.data=s:(s=Ki(n),s!==null&&(f.data=s)),Ln(f),s=f):s=null,(e=fs?ps(e,n):hs(e,n))?(t=cs.getPooled(Wt.beforeInput,t,n,r),t.data=e,Ln(t)):t=null,s===null?t:t===null?s:[s,t]},"extractEvents")},Yi={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Gi(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Yi[e.type]:t==="textarea"}i(Gi,"xe");var Xi={change:{phasedRegistrationNames:{bubbled:"onChange",captured:"onChangeCapture"},dependencies:"blur change click focus input keydown keyup selectionchange".split(" ")}};function Vo(e,t,n){return e=kt.getPooled(Xi.change,e,t,n),e.type="change",ze(n),Ln(e),e}i(Vo,"ze");var sr=null,ar=null;function vs(e){Rr(e)}i(vs,"Ce");function $o(e){var t=Vt(e);if(ci(t))return e}i($o,"De");function ur(e,t){if(e==="change")return t}i(ur,"Ee");var Vr=!1;ue&&(Vr=Kl("input")&&(!document.documentMode||9<document.documentMode));function Ji(){sr&&(sr.detachEvent("onpropertychange",el),ar=sr=null)}i(Ji,"Ge");function el(e){if(e.propertyName==="value"&&$o(ar))if(e=Vo(ar,e,Je(e)),We)Rr(e);else{We=!0;try{Ke(vs,e)}finally{We=!1,K()}}}i(el,"He");function gs(e,t,n){e==="focus"?(Ji(),sr=t,ar=n,sr.attachEvent("onpropertychange",el)):e==="blur"&&Ji()}i(gs,"Ie");function ys(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return $o(ar)}i(ys,"Je");function Cs(e,t){if(e==="click")return $o(t)}i(Cs,"Ke");function tl(e,t){if(e==="input"||e==="change")return $o(t)}i(tl,"Le");var nl={eventTypes:Xi,_isInputEventSupported:Vr,extractEvents:i(function(e,t,n,r){var s=t?Vt(t):window,f=s.nodeName&&s.nodeName.toLowerCase();if(f==="select"||f==="input"&&s.type==="file")var m=ur;else if(Gi(s))if(Vr)m=tl;else{m=ys;var v=gs}else(f=s.nodeName)&&f.toLowerCase()==="input"&&(s.type==="checkbox"||s.type==="radio")&&(m=Cs);if(m&&(m=m(e,t)))return Vo(m,n,r);v&&v(e,s,t),e==="blur"&&(e=s._wrapperState)&&e.controlled&&s.type==="number"&&mi(s,"number",s.value)},"extractEvents")},cr=kt.extend({view:null,detail:null}),ws={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function xs(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=ws[e])?!!t[e]:!1}i(xs,"Pe");function $r(){return xs}i($r,"Qe");var dr=0,rl=0,zr=!1,zo=!1,fr=cr.extend({screenX:null,screenY:null,clientX:null,clientY:null,pageX:null,pageY:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,getModifierState:$r,button:null,buttons:null,relatedTarget:i(function(e){return e.relatedTarget||(e.fromElement===e.srcElement?e.toElement:e.fromElement)},"relatedTarget"),movementX:i(function(e){if("movementX"in e)return e.movementX;var t=dr;return dr=e.screenX,zr?e.type==="mousemove"?e.screenX-t:0:(zr=!0,0)},"movementX"),movementY:i(function(e){if("movementY"in e)return e.movementY;var t=rl;return rl=e.screenY,zo?e.type==="mousemove"?e.screenY-t:0:(zo=!0,0)},"movementY")}),ol=fr.extend({pointerId:null,width:null,height:null,pressure:null,tangentialPressure:null,tiltX:null,tiltY:null,twist:null,pointerType:null,isPrimary:null}),Tn={mouseEnter:{registrationName:"onMouseEnter",dependencies:["mouseout","mouseover"]},mouseLeave:{registrationName:"onMouseLeave",dependencies:["mouseout","mouseover"]},pointerEnter:{registrationName:"onPointerEnter",dependencies:["pointerout","pointerover"]},pointerLeave:{registrationName:"onPointerLeave",dependencies:["pointerout","pointerover"]}},Es={eventTypes:Tn,extractEvents:i(function(e,t,n,r,s){var f=e==="mouseover"||e==="pointerover",m=e==="mouseout"||e==="pointerout";if(f&&!(s&32)&&(n.relatedTarget||n.fromElement)||!m&&!f)return null;if(f=r.window===r?r:(f=r.ownerDocument)?f.defaultView||f.parentWindow:window,m){if(m=t,t=(t=n.relatedTarget||n.toElement)?or(t):null,t!==null){var v=rn(t);(t!==v||t.tag!==5&&t.tag!==6)&&(t=null)}}else m=null;if(m===t)return null;if(e==="mouseout"||e==="mouseover")var L=fr,S=Tn.mouseLeave,ne=Tn.mouseEnter,se="mouse";else(e==="pointerout"||e==="pointerover")&&(L=ol,S=Tn.pointerLeave,ne=Tn.pointerEnter,se="pointer");if(e=m==null?f:Vt(m),f=t==null?f:Vt(t),S=L.getPooled(S,m,n,r),S.type=se+"leave",S.target=e,S.relatedTarget=f,n=L.getPooled(ne,t,n,r),n.type=se+"enter",n.target=f,n.relatedTarget=e,r=m,se=t,r&&se)e:{for(L=r,ne=se,m=0,e=L;e;e=Ut(e))m++;for(e=0,t=ne;t;t=Ut(t))e++;for(;0<m-e;)L=Ut(L),m--;for(;0<e-m;)ne=Ut(ne),e--;for(;m--;){if(L===ne||L===ne.alternate)break e;L=Ut(L),ne=Ut(ne)}L=null}else L=null;for(ne=L,L=[];r&&r!==ne&&(m=r.alternate,!(m!==null&&m===ne));)L.push(r),r=Ut(r);for(r=[];se&&se!==ne&&(m=se.alternate,!(m!==null&&m===ne));)r.push(se),se=Ut(se);for(se=0;se<L.length;se++)ot(L[se],"bubbled",S);for(se=r.length;0<se--;)ot(r[se],"captured",n);return s&64?[S,n]:[S]},"extractEvents")};function _a(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}i(_a,"Ze");var Mn=typeof Object.is=="function"?Object.is:_a,bs=Object.prototype.hasOwnProperty;function Br(e,t){if(Mn(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++)if(!bs.call(t,n[r])||!Mn(e[n[r]],t[n[r]]))return!1;return!0}i(Br,"bf");var ks=ue&&"documentMode"in document&&11>=document.documentMode,il={select:{phasedRegistrationNames:{bubbled:"onSelect",captured:"onSelectCapture"},dependencies:"blur contextmenu dragend focus keydown keyup mousedown mouseup selectionchange".split(" ")}},Nn=null,Bo=null,Rn=null,jo=!1;function Uo(e,t){var n=t.window===t?t.document:t.nodeType===9?t:t.ownerDocument;return jo||Nn==null||Nn!==tr(n)?null:(n=Nn,"selectionStart"in n&&No(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),Rn&&Br(Rn,n)?null:(Rn=n,e=kt.getPooled(il.select,Bo,e,t),e.type="select",e.target=Nn,Ln(e),e))}i(Uo,"jf");var _s={eventTypes:il,extractEvents:i(function(e,t,n,r,s,f){if(s=f||(r.window===r?r.document:r.nodeType===9?r:r.ownerDocument),!(f=!s)){e:{s=mo(s),f=re.onSelect;for(var m=0;m<f.length;m++)if(!s.has(f[m])){s=!1;break e}s=!0}f=!s}if(f)return null;switch(s=t?Vt(t):window,e){case"focus":(Gi(s)||s.contentEditable==="true")&&(Nn=s,Bo=t,Rn=null);break;case"blur":Rn=Bo=Nn=null;break;case"mousedown":jo=!0;break;case"contextmenu":case"mouseup":case"dragend":return jo=!1,Uo(n,r);case"selectionchange":if(ks)break;case"keydown":case"keyup":return Uo(n,r)}return null},"extractEvents")},La=kt.extend({animationName:null,elapsedTime:null,pseudoElement:null}),Ls=kt.extend({clipboardData:i(function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData},"clipboardData")}),Ss=cr.extend({relatedTarget:null});function jr(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}i(jr,"of");var Ts={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Ms={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Ns=cr.extend({key:i(function(e){if(e.key){var t=Ts[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=jr(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Ms[e.keyCode]||"Unidentified":""},"key"),location:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,repeat:null,locale:null,getModifierState:$r,charCode:i(function(e){return e.type==="keypress"?jr(e):0},"charCode"),keyCode:i(function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},"keyCode"),which:i(function(e){return e.type==="keypress"?jr(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0},"which")}),Rs=fr.extend({dataTransfer:null}),Ps=cr.extend({touches:null,targetTouches:null,changedTouches:null,altKey:null,metaKey:null,ctrlKey:null,shiftKey:null,getModifierState:$r}),Os=kt.extend({propertyName:null,elapsedTime:null,pseudoElement:null}),Ds=fr.extend({deltaX:i(function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},"deltaX"),deltaY:i(function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},"deltaY"),deltaZ:null,deltaMode:null}),As={eventTypes:Pi,extractEvents:i(function(e,t,n,r){var s=Pr.get(e);if(!s)return null;switch(e){case"keypress":if(jr(n)===0)return null;case"keydown":case"keyup":e=Ns;break;case"blur":case"focus":e=Ss;break;case"click":if(n.button===2)return null;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":e=fr;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":e=Rs;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":e=Ps;break;case Wl:case Ei:case Qn:e=La;break;case bi:e=Os;break;case"scroll":e=cr;break;case"wheel":e=Ds;break;case"copy":case"cut":case"paste":e=Ls;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":e=ol;break;default:e=kt}return t=e.getPooled(s,t,n,r),Ln(t),t},"extractEvents")};if(N)throw Error(h(101));N=Array.prototype.slice.call("ResponderEventPlugin SimpleEventPlugin EnterLeaveEventPlugin ChangeEventPlugin SelectEventPlugin BeforeInputEventPlugin".split(" ")),ie();var ll=ir;fe=Io,Ae=ll,rt=Vt,X({SimpleEventPlugin:As,EnterLeaveEventPlugin:Es,ChangeEventPlugin:nl,SelectEventPlugin:_s,BeforeInputEventPlugin:Fr});var Ur=[],Pn=-1;function Ge(e){0>Pn||(e.current=Ur[Pn],Ur[Pn]=null,Pn--)}i(Ge,"H");function et(e,t){Pn++,Ur[Pn]=e.current,e.current=t}i(et,"I");var Yt={},ft={current:Yt},Ct={current:!1},fn=Yt;function mn(e,t){var n=e.type.contextTypes;if(!n)return Yt;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var s={},f;for(f in n)s[f]=t[f];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=s),s}i(mn,"Cf");function wt(e){return e=e.childContextTypes,e!=null}i(wt,"L");function Wr(){Ge(Ct),Ge(ft)}i(Wr,"Df");function qr(e,t,n){if(ft.current!==Yt)throw Error(h(168));et(ft,t),et(Ct,n)}i(qr,"Ef");function pn(e,t,n){var r=e.stateNode;if(e=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var s in r)if(!(s in e))throw Error(h(108,At(t)||"Unknown",s));return T({},n,{},r)}i(pn,"Ff");function On(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Yt,fn=ft.current,et(ft,e),et(Ct,Ct.current),!0}i(On,"Gf");function Zr(e,t,n){var r=e.stateNode;if(!r)throw Error(h(169));n?(e=pn(e,t,fn),r.__reactInternalMemoizedMergedChildContext=e,Ge(Ct),Ge(ft),et(ft,e)):Ge(Ct),et(Ct,n)}i(Zr,"Hf");var Wo=g.unstable_runWithPriority,mr=g.unstable_scheduleCallback,Qr=g.unstable_cancelCallback,Kr=g.unstable_requestPaint,pr=g.unstable_now,hn=g.unstable_getCurrentPriorityLevel,Dn=g.unstable_ImmediatePriority,Yr=g.unstable_UserBlockingPriority,Gr=g.unstable_NormalPriority,Xr=g.unstable_LowPriority,o=g.unstable_IdlePriority,a={},u=g.unstable_shouldYield,c=Kr!==void 0?Kr:function(){},d=null,p=null,y=!1,C=pr(),x=1e4>C?pr:function(){return pr()-C};function R(){switch(hn()){case Dn:return 99;case Yr:return 98;case Gr:return 97;case Xr:return 96;case o:return 95;default:throw Error(h(332))}}i(R,"ag");function Q(e){switch(e){case 99:return Dn;case 98:return Yr;case 97:return Gr;case 96:return Xr;case 95:return o;default:throw Error(h(332))}}i(Q,"bg");function F(e,t){return e=Q(e),Wo(e,t)}i(F,"cg");function le(e,t,n){return e=Q(e),mr(e,t,n)}i(le,"dg");function me(e){return d===null?(d=[e],p=mr(Dn,Pe)):d.push(e),a}i(me,"eg");function P(){if(p!==null){var e=p;p=null,Qr(e)}Pe()}i(P,"gg");function Pe(){if(!y&&d!==null){y=!0;var e=0;try{var t=d;F(99,function(){for(;e<t.length;e++){var n=t[e];do n=n(!0);while(n!==null)}}),d=null}catch(n){throw d!==null&&(d=d.slice(e+1)),mr(Dn,P),n}finally{y=!1}}}i(Pe,"fg");function Ce(e,t,n){return n/=10,1073741821-(((1073741821-e+t/10)/n|0)+1)*n}i(Ce,"hg");function xe(e,t){if(e&&e.defaultProps){t=T({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n])}return t}i(xe,"ig");var je={current:null},Ie=null,Le=null,Xe=null;function Ee(){Xe=Le=Ie=null}i(Ee,"ng");function qe(e){var t=je.current;Ge(je),e.type._context._currentValue=t}i(qe,"og");function vt(e,t){for(;e!==null;){var n=e.alternate;if(e.childExpirationTime<t)e.childExpirationTime=t,n!==null&&n.childExpirationTime<t&&(n.childExpirationTime=t);else if(n!==null&&n.childExpirationTime<t)n.childExpirationTime=t;else break;e=e.return}}i(vt,"pg");function Nt(e,t){Ie=e,Xe=Le=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.expirationTime>=t&&(Xt=!0),e.firstContext=null)}i(Nt,"qg");function Ze(e,t){if(Xe!==e&&t!==!1&&t!==0)if((typeof t!="number"||t===1073741823)&&(Xe=e,t=1073741823),t={context:e,observedBits:t,next:null},Le===null){if(Ie===null)throw Error(h(308));Le=t,Ie.dependencies={expirationTime:0,firstContext:t,responders:null}}else Le=Le.next=t;return e._currentValue}i(Ze,"sg");var it=!1;function An(e){e.updateQueue={baseState:e.memoizedState,baseQueue:null,shared:{pending:null},effects:null}}i(An,"ug");function Qe(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,baseQueue:e.baseQueue,shared:e.shared,effects:e.effects})}i(Qe,"vg");function at(e,t){return e={expirationTime:e,suspenseConfig:t,tag:0,payload:null,callback:null,next:null},e.next=e}i(at,"wg");function qt(e,t){if(e=e.updateQueue,e!==null){e=e.shared;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}}i(qt,"xg");function sl(e,t){var n=e.alternate;n!==null&&Qe(n,e),e=e.updateQueue,n=e.baseQueue,n===null?(e.baseQueue=t.next=t,t.next=t):(t.next=n.next,n.next=t)}i(sl,"yg");function qo(e,t,n,r){var s=e.updateQueue;it=!1;var f=s.baseQueue,m=s.shared.pending;if(m!==null){if(f!==null){var v=f.next;f.next=m.next,m.next=v}f=m,s.shared.pending=null,v=e.alternate,v!==null&&(v=v.updateQueue,v!==null&&(v.baseQueue=m))}if(f!==null){v=f.next;var L=s.baseState,S=0,ne=null,se=null,Fe=null;if(v!==null){var Ue=v;do{if(m=Ue.expirationTime,m<r){var zt={expirationTime:Ue.expirationTime,suspenseConfig:Ue.suspenseConfig,tag:Ue.tag,payload:Ue.payload,callback:Ue.callback,next:null};Fe===null?(se=Fe=zt,ne=L):Fe=Fe.next=zt,m>S&&(S=m)}else{Fe!==null&&(Fe=Fe.next={expirationTime:1073741823,suspenseConfig:Ue.suspenseConfig,tag:Ue.tag,payload:Ue.payload,callback:Ue.callback,next:null}),Eu(m,Ue.suspenseConfig);e:{var gt=e,b=Ue;switch(m=t,zt=n,b.tag){case 1:if(gt=b.payload,typeof gt=="function"){L=gt.call(zt,L,m);break e}L=gt;break e;case 3:gt.effectTag=gt.effectTag&-4097|64;case 0:if(gt=b.payload,m=typeof gt=="function"?gt.call(zt,L,m):gt,m==null)break e;L=T({},L,m);break e;case 2:it=!0}}Ue.callback!==null&&(e.effectTag|=32,m=s.effects,m===null?s.effects=[Ue]:m.push(Ue))}if(Ue=Ue.next,Ue===null||Ue===v){if(m=s.shared.pending,m===null)break;Ue=f.next=m.next,m.next=v,s.baseQueue=f=m,s.shared.pending=null}}while(!0)}Fe===null?ne=L:Fe.next=se,s.baseState=ne,s.baseQueue=Fe,Dl(S),e.expirationTime=S,e.memoizedState=L}}i(qo,"zg");function Sa(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],s=r.callback;if(s!==null){if(r.callback=null,r=s,s=n,typeof r!="function")throw Error(h(191,r));r.call(s)}}}i(Sa,"Cg");var Zo=_t.ReactCurrentBatchConfig,Ta=new $.Component().refs;function al(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:T({},t,n),e.memoizedState=n,e.expirationTime===0&&(e.updateQueue.baseState=n)}i(al,"Fg");var ul={isMounted:i(function(e){return(e=e._reactInternalFiber)?rn(e)===e:!1},"isMounted"),enqueueSetState:i(function(e,t,n){e=e._reactInternalFiber;var r=en(),s=Zo.suspense;r=wr(r,e,s),s=at(r,s),s.payload=t,n!=null&&(s.callback=n),qt(e,s),Vn(e,r)},"enqueueSetState"),enqueueReplaceState:i(function(e,t,n){e=e._reactInternalFiber;var r=en(),s=Zo.suspense;r=wr(r,e,s),s=at(r,s),s.tag=1,s.payload=t,n!=null&&(s.callback=n),qt(e,s),Vn(e,r)},"enqueueReplaceState"),enqueueForceUpdate:i(function(e,t){e=e._reactInternalFiber;var n=en(),r=Zo.suspense;n=wr(n,e,r),r=at(n,r),r.tag=2,t!=null&&(r.callback=t),qt(e,r),Vn(e,n)},"enqueueForceUpdate")};function Ma(e,t,n,r,s,f,m){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,f,m):t.prototype&&t.prototype.isPureReactComponent?!Br(n,r)||!Br(s,f):!0}i(Ma,"Kg");function Na(e,t,n){var r=!1,s=Yt,f=t.contextType;return typeof f=="object"&&f!==null?f=Ze(f):(s=wt(t)?fn:ft.current,r=t.contextTypes,f=(r=r!=null)?mn(e,s):Yt),t=new t(n,f),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=ul,e.stateNode=t,t._reactInternalFiber=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=s,e.__reactInternalMemoizedMaskedChildContext=f),t}i(Na,"Lg");function Ra(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&ul.enqueueReplaceState(t,t.state,null)}i(Ra,"Mg");function Is(e,t,n,r){var s=e.stateNode;s.props=n,s.state=e.memoizedState,s.refs=Ta,An(e);var f=t.contextType;typeof f=="object"&&f!==null?s.context=Ze(f):(f=wt(t)?fn:ft.current,s.context=mn(e,f)),qo(e,n,s,r),s.state=e.memoizedState,f=t.getDerivedStateFromProps,typeof f=="function"&&(al(e,t,f,n),s.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(t=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),t!==s.state&&ul.enqueueReplaceState(s,s.state,null),qo(e,n,s,r),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.effectTag|=4)}i(Is,"Ng");var cl=Array.isArray;function Qo(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(h(309));var r=n.stateNode}if(!r)throw Error(h(147,e));var s=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===s?t.ref:(t=i(function(f){var m=r.refs;m===Ta&&(m=r.refs={}),f===null?delete m[s]:m[s]=f},"b"),t._stringRef=s,t)}if(typeof e!="string")throw Error(h(284));if(!n._owner)throw Error(h(290,e))}return e}i(Qo,"Pg");function dl(e,t){if(e.type!=="textarea")throw Error(h(31,Object.prototype.toString.call(t)==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":t,""))}i(dl,"Qg");function Pa(e){function t(b,E){if(e){var M=b.lastEffect;M!==null?(M.nextEffect=E,b.lastEffect=E):b.firstEffect=b.lastEffect=E,E.nextEffect=null,E.effectTag=8}}i(t,"b");function n(b,E){if(!e)return null;for(;E!==null;)t(b,E),E=E.sibling;return null}i(n,"c");function r(b,E){for(b=new Map;E!==null;)E.key!==null?b.set(E.key,E):b.set(E.index,E),E=E.sibling;return b}i(r,"d");function s(b,E){return b=kr(b,E),b.index=0,b.sibling=null,b}i(s,"e");function f(b,E,M){return b.index=M,e?(M=b.alternate,M!==null?(M=M.index,M<E?(b.effectTag=2,E):M):(b.effectTag=2,E)):E}i(f,"f");function m(b){return e&&b.alternate===null&&(b.effectTag=2),b}i(m,"g");function v(b,E,M,W){return E===null||E.tag!==6?(E=ga(M,b.mode,W),E.return=b,E):(E=s(E,M),E.return=b,E)}i(v,"h");function L(b,E,M,W){return E!==null&&E.elementType===M.type?(W=s(E,M.props),W.ref=Qo(b,E,M),W.return=b,W):(W=Al(M.type,M.key,M.props,null,b.mode,W),W.ref=Qo(b,E,M),W.return=b,W)}i(L,"k");function S(b,E,M,W){return E===null||E.tag!==4||E.stateNode.containerInfo!==M.containerInfo||E.stateNode.implementation!==M.implementation?(E=ya(M,b.mode,W),E.return=b,E):(E=s(E,M.children||[]),E.return=b,E)}i(S,"l");function ne(b,E,M,W,te){return E===null||E.tag!==7?(E=$n(M,b.mode,W,te),E.return=b,E):(E=s(E,M),E.return=b,E)}i(ne,"m");function se(b,E,M){if(typeof E=="string"||typeof E=="number")return E=ga(""+E,b.mode,M),E.return=b,E;if(typeof E=="object"&&E!==null){switch(E.$$typeof){case be:return M=Al(E.type,E.key,E.props,null,b.mode,M),M.ref=Qo(b,null,E),M.return=b,M;case Bn:return E=ya(E,b.mode,M),E.return=b,E}if(cl(E)||Un(E))return E=$n(E,b.mode,M,null),E.return=b,E;dl(b,E)}return null}i(se,"p");function Fe(b,E,M,W){var te=E!==null?E.key:null;if(typeof M=="string"||typeof M=="number")return te!==null?null:v(b,E,""+M,W);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case be:return M.key===te?M.type===Qt?ne(b,E,M.props.children,W,te):L(b,E,M,W):null;case Bn:return M.key===te?S(b,E,M,W):null}if(cl(M)||Un(M))return te!==null?null:ne(b,E,M,W,null);dl(b,M)}return null}i(Fe,"x");function Ue(b,E,M,W,te){if(typeof W=="string"||typeof W=="number")return b=b.get(M)||null,v(E,b,""+W,te);if(typeof W=="object"&&W!==null){switch(W.$$typeof){case be:return b=b.get(W.key===null?M:W.key)||null,W.type===Qt?ne(E,b,W.props.children,te,W.key):L(E,b,W,te);case Bn:return b=b.get(W.key===null?M:W.key)||null,S(E,b,W,te)}if(cl(W)||Un(W))return b=b.get(M)||null,ne(E,b,W,te,null);dl(E,W)}return null}i(Ue,"z");function zt(b,E,M,W){for(var te=null,ae=null,we=E,$e=E=0,tt=null;we!==null&&$e<M.length;$e++){we.index>$e?(tt=we,we=null):tt=we.sibling;var Oe=Fe(b,we,M[$e],W);if(Oe===null){we===null&&(we=tt);break}e&&we&&Oe.alternate===null&&t(b,we),E=f(Oe,E,$e),ae===null?te=Oe:ae.sibling=Oe,ae=Oe,we=tt}if($e===M.length)return n(b,we),te;if(we===null){for(;$e<M.length;$e++)we=se(b,M[$e],W),we!==null&&(E=f(we,E,$e),ae===null?te=we:ae.sibling=we,ae=we);return te}for(we=r(b,we);$e<M.length;$e++)tt=Ue(we,b,$e,M[$e],W),tt!==null&&(e&&tt.alternate!==null&&we.delete(tt.key===null?$e:tt.key),E=f(tt,E,$e),ae===null?te=tt:ae.sibling=tt,ae=tt);return e&&we.forEach(function(zn){return t(b,zn)}),te}i(zt,"ca");function gt(b,E,M,W){var te=Un(M);if(typeof te!="function")throw Error(h(150));if(M=te.call(M),M==null)throw Error(h(151));for(var ae=te=null,we=E,$e=E=0,tt=null,Oe=M.next();we!==null&&!Oe.done;$e++,Oe=M.next()){we.index>$e?(tt=we,we=null):tt=we.sibling;var zn=Fe(b,we,Oe.value,W);if(zn===null){we===null&&(we=tt);break}e&&we&&zn.alternate===null&&t(b,we),E=f(zn,E,$e),ae===null?te=zn:ae.sibling=zn,ae=zn,we=tt}if(Oe.done)return n(b,we),te;if(we===null){for(;!Oe.done;$e++,Oe=M.next())Oe=se(b,Oe.value,W),Oe!==null&&(E=f(Oe,E,$e),ae===null?te=Oe:ae.sibling=Oe,ae=Oe);return te}for(we=r(b,we);!Oe.done;$e++,Oe=M.next())Oe=Ue(we,b,$e,Oe.value,W),Oe!==null&&(e&&Oe.alternate!==null&&we.delete(Oe.key===null?$e:Oe.key),E=f(Oe,E,$e),ae===null?te=Oe:ae.sibling=Oe,ae=Oe);return e&&we.forEach(function(oc){return t(b,oc)}),te}return i(gt,"D"),function(b,E,M,W){var te=typeof M=="object"&&M!==null&&M.type===Qt&&M.key===null;te&&(M=M.props.children);var ae=typeof M=="object"&&M!==null;if(ae)switch(M.$$typeof){case be:e:{for(ae=M.key,te=E;te!==null;){if(te.key===ae){switch(te.tag){case 7:if(M.type===Qt){n(b,te.sibling),E=s(te,M.props.children),E.return=b,b=E;break e}break;default:if(te.elementType===M.type){n(b,te.sibling),E=s(te,M.props),E.ref=Qo(b,te,M),E.return=b,b=E;break e}}n(b,te);break}else t(b,te);te=te.sibling}M.type===Qt?(E=$n(M.props.children,b.mode,W,M.key),E.return=b,b=E):(W=Al(M.type,M.key,M.props,null,b.mode,W),W.ref=Qo(b,E,M),W.return=b,b=W)}return m(b);case Bn:e:{for(te=M.key;E!==null;){if(E.key===te)if(E.tag===4&&E.stateNode.containerInfo===M.containerInfo&&E.stateNode.implementation===M.implementation){n(b,E.sibling),E=s(E,M.children||[]),E.return=b,b=E;break e}else{n(b,E);break}else t(b,E);E=E.sibling}E=ya(M,b.mode,W),E.return=b,b=E}return m(b)}if(typeof M=="string"||typeof M=="number")return M=""+M,E!==null&&E.tag===6?(n(b,E.sibling),E=s(E,M),E.return=b,b=E):(n(b,E),E=ga(M,b.mode,W),E.return=b,b=E),m(b);if(cl(M))return zt(b,E,M,W);if(Un(M))return gt(b,E,M,W);if(ae&&dl(b,M),typeof M=="undefined"&&!te)switch(b.tag){case 1:case 0:throw b=b.type,Error(h(152,b.displayName||b.name||"Component"))}return n(b,E)}}i(Pa,"Rg");var Jr=Pa(!0),Hs=Pa(!1),Ko={},Gt={current:Ko},Yo={current:Ko},Go={current:Ko};function hr(e){if(e===Ko)throw Error(h(174));return e}i(hr,"ch");function Fs(e,t){switch(et(Go,t),et(Yo,e),et(Gt,Ko),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:fo(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=fo(t,e)}Ge(Gt),et(Gt,t)}i(Fs,"dh");function eo(){Ge(Gt),Ge(Yo),Ge(Go)}i(eo,"eh");function Oa(e){hr(Go.current);var t=hr(Gt.current),n=fo(t,e.type);t!==n&&(et(Yo,e),et(Gt,n))}i(Oa,"fh");function Vs(e){Yo.current===e&&(Ge(Gt),Ge(Yo))}i(Vs,"gh");var nt={current:0};function fl(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data===dn||n.data===nr))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.effectTag&64)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}i(fl,"hh");function $s(e,t){return{responder:e,props:t}}i($s,"ih");var ml=_t.ReactCurrentDispatcher,$t=_t.ReactCurrentBatchConfig,In=0,ut=null,xt=null,Et=null,pl=!1;function Rt(){throw Error(h(321))}i(Rt,"Q");function zs(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Mn(e[n],t[n]))return!1;return!0}i(zs,"nh");function Bs(e,t,n,r,s,f){if(In=f,ut=t,t.memoizedState=null,t.updateQueue=null,t.expirationTime=0,ml.current=e===null||e.memoizedState===null?Ru:Pu,e=n(r,s),t.expirationTime===In){f=0;do{if(t.expirationTime=0,!(25>f))throw Error(h(301));f+=1,Et=xt=null,t.updateQueue=null,ml.current=Ou,e=n(r,s)}while(t.expirationTime===In)}if(ml.current=Cl,t=xt!==null&&xt.next!==null,In=0,Et=xt=ut=null,pl=!1,t)throw Error(h(300));return e}i(Bs,"oh");function to(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Et===null?ut.memoizedState=Et=e:Et=Et.next=e,Et}i(to,"th");function no(){if(xt===null){var e=ut.alternate;e=e!==null?e.memoizedState:null}else e=xt.next;var t=Et===null?ut.memoizedState:Et.next;if(t!==null)Et=t,xt=e;else{if(e===null)throw Error(h(310));xt=e,e={memoizedState:xt.memoizedState,baseState:xt.baseState,baseQueue:xt.baseQueue,queue:xt.queue,next:null},Et===null?ut.memoizedState=Et=e:Et=Et.next=e}return Et}i(no,"uh");function vr(e,t){return typeof t=="function"?t(e):t}i(vr,"vh");function hl(e){var t=no(),n=t.queue;if(n===null)throw Error(h(311));n.lastRenderedReducer=e;var r=xt,s=r.baseQueue,f=n.pending;if(f!==null){if(s!==null){var m=s.next;s.next=f.next,f.next=m}r.baseQueue=s=f,n.pending=null}if(s!==null){s=s.next,r=r.baseState;var v=m=f=null,L=s;do{var S=L.expirationTime;if(S<In){var ne={expirationTime:L.expirationTime,suspenseConfig:L.suspenseConfig,action:L.action,eagerReducer:L.eagerReducer,eagerState:L.eagerState,next:null};v===null?(m=v=ne,f=r):v=v.next=ne,S>ut.expirationTime&&(ut.expirationTime=S,Dl(S))}else v!==null&&(v=v.next={expirationTime:1073741823,suspenseConfig:L.suspenseConfig,action:L.action,eagerReducer:L.eagerReducer,eagerState:L.eagerState,next:null}),Eu(S,L.suspenseConfig),r=L.eagerReducer===e?L.eagerState:e(r,L.action);L=L.next}while(L!==null&&L!==s);v===null?f=r:v.next=m,Mn(r,t.memoizedState)||(Xt=!0),t.memoizedState=r,t.baseState=f,t.baseQueue=v,n.lastRenderedState=r}return[t.memoizedState,n.dispatch]}i(hl,"wh");function vl(e){var t=no(),n=t.queue;if(n===null)throw Error(h(311));n.lastRenderedReducer=e;var r=n.dispatch,s=n.pending,f=t.memoizedState;if(s!==null){n.pending=null;var m=s=s.next;do f=e(f,m.action),m=m.next;while(m!==s);Mn(f,t.memoizedState)||(Xt=!0),t.memoizedState=f,t.baseQueue===null&&(t.baseState=f),n.lastRenderedState=f}return[f,r]}i(vl,"xh");function js(e){var t=to();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e=t.queue={pending:null,dispatch:null,lastRenderedReducer:vr,lastRenderedState:e},e=e.dispatch=za.bind(null,ut,e),[t.memoizedState,e]}i(js,"yh");function Us(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=ut.updateQueue,t===null?(t={lastEffect:null},ut.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}i(Us,"Ah");function Da(){return no().memoizedState}i(Da,"Bh");function Ws(e,t,n,r){var s=to();ut.effectTag|=e,s.memoizedState=Us(1|t,n,void 0,r===void 0?null:r)}i(Ws,"Ch");function qs(e,t,n,r){var s=no();r=r===void 0?null:r;var f=void 0;if(xt!==null){var m=xt.memoizedState;if(f=m.destroy,r!==null&&zs(r,m.deps)){Us(t,n,f,r);return}}ut.effectTag|=e,s.memoizedState=Us(1|t,n,f,r)}i(qs,"Dh");function Aa(e,t){return Ws(516,4,e,t)}i(Aa,"Eh");function gl(e,t){return qs(516,4,e,t)}i(gl,"Fh");function Ia(e,t){return qs(4,2,e,t)}i(Ia,"Gh");function Ha(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}i(Ha,"Hh");function Fa(e,t,n){return n=n!=null?n.concat([e]):null,qs(4,2,Ha.bind(null,t,e),n)}i(Fa,"Ih");function Zs(){}i(Zs,"Jh");function Va(e,t){return to().memoizedState=[e,t===void 0?null:t],e}i(Va,"Kh");function yl(e,t){var n=no();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&zs(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}i(yl,"Lh");function $a(e,t){var n=no();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&zs(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}i($a,"Mh");function Qs(e,t,n){var r=R();F(98>r?98:r,function(){e(!0)}),F(97<r?97:r,function(){var s=$t.suspense;$t.suspense=t===void 0?null:t;try{e(!1),n()}finally{$t.suspense=s}})}i(Qs,"Nh");function za(e,t,n){var r=en(),s=Zo.suspense;r=wr(r,e,s),s={expirationTime:r,suspenseConfig:s,action:n,eagerReducer:null,eagerState:null,next:null};var f=t.pending;if(f===null?s.next=s:(s.next=f.next,f.next=s),t.pending=s,f=e.alternate,e===ut||f!==null&&f===ut)pl=!0,s.expirationTime=In,ut.expirationTime=In;else{if(e.expirationTime===0&&(f===null||f.expirationTime===0)&&(f=t.lastRenderedReducer,f!==null))try{var m=t.lastRenderedState,v=f(m,n);if(s.eagerReducer=f,s.eagerState=v,Mn(v,m))return}catch{}finally{}Vn(e,r)}}i(za,"zh");var Cl={readContext:Ze,useCallback:Rt,useContext:Rt,useEffect:Rt,useImperativeHandle:Rt,useLayoutEffect:Rt,useMemo:Rt,useReducer:Rt,useRef:Rt,useState:Rt,useDebugValue:Rt,useResponder:Rt,useDeferredValue:Rt,useTransition:Rt},Ru={readContext:Ze,useCallback:Va,useContext:Ze,useEffect:Aa,useImperativeHandle:i(function(e,t,n){return n=n!=null?n.concat([e]):null,Ws(4,2,Ha.bind(null,t,e),n)},"useImperativeHandle"),useLayoutEffect:i(function(e,t){return Ws(4,2,e,t)},"useLayoutEffect"),useMemo:i(function(e,t){var n=to();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},"useMemo"),useReducer:i(function(e,t,n){var r=to();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e=r.queue={pending:null,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},e=e.dispatch=za.bind(null,ut,e),[r.memoizedState,e]},"useReducer"),useRef:i(function(e){var t=to();return e={current:e},t.memoizedState=e},"useRef"),useState:js,useDebugValue:Zs,useResponder:$s,useDeferredValue:i(function(e,t){var n=js(e),r=n[0],s=n[1];return Aa(function(){var f=$t.suspense;$t.suspense=t===void 0?null:t;try{s(e)}finally{$t.suspense=f}},[e,t]),r},"useDeferredValue"),useTransition:i(function(e){var t=js(!1),n=t[0];return t=t[1],[Va(Qs.bind(null,t,e),[t,e]),n]},"useTransition")},Pu={readContext:Ze,useCallback:yl,useContext:Ze,useEffect:gl,useImperativeHandle:Fa,useLayoutEffect:Ia,useMemo:$a,useReducer:hl,useRef:Da,useState:i(function(){return hl(vr)},"useState"),useDebugValue:Zs,useResponder:$s,useDeferredValue:i(function(e,t){var n=hl(vr),r=n[0],s=n[1];return gl(function(){var f=$t.suspense;$t.suspense=t===void 0?null:t;try{s(e)}finally{$t.suspense=f}},[e,t]),r},"useDeferredValue"),useTransition:i(function(e){var t=hl(vr),n=t[0];return t=t[1],[yl(Qs.bind(null,t,e),[t,e]),n]},"useTransition")},Ou={readContext:Ze,useCallback:yl,useContext:Ze,useEffect:gl,useImperativeHandle:Fa,useLayoutEffect:Ia,useMemo:$a,useReducer:vl,useRef:Da,useState:i(function(){return vl(vr)},"useState"),useDebugValue:Zs,useResponder:$s,useDeferredValue:i(function(e,t){var n=vl(vr),r=n[0],s=n[1];return gl(function(){var f=$t.suspense;$t.suspense=t===void 0?null:t;try{s(e)}finally{$t.suspense=f}},[e,t]),r},"useDeferredValue"),useTransition:i(function(e){var t=vl(vr),n=t[0];return t=t[1],[yl(Qs.bind(null,t,e),[t,e]),n]},"useTransition")},vn=null,Hn=null,gr=!1;function Ba(e,t){var n=tn(5,null,null,0);n.elementType="DELETED",n.type="DELETED",n.stateNode=t,n.return=e,n.effectTag=8,e.lastEffect!==null?(e.lastEffect.nextEffect=n,e.lastEffect=n):e.firstEffect=e.lastEffect=n}i(Ba,"Rh");function ja(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,!0):!1;case 13:return!1;default:return!1}}i(ja,"Th");function Ks(e){if(gr){var t=Hn;if(t){var n=t;if(!ja(e,t)){if(t=_n(n.nextSibling),!t||!ja(e,t)){e.effectTag=e.effectTag&-1025|2,gr=!1,vn=e;return}Ba(vn,n)}vn=e,Hn=_n(t.firstChild)}else e.effectTag=e.effectTag&-1025|2,gr=!1,vn=e}}i(Ks,"Uh");function Ua(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;vn=e}i(Ua,"Vh");function wl(e){if(e!==vn)return!1;if(!gr)return Ua(e),gr=!0,!1;var t=e.type;if(e.tag!==5||t!=="head"&&t!=="body"&&!Oo(t,e.memoizedProps))for(t=Hn;t;)Ba(e,t),t=_n(t.nextSibling);if(Ua(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(h(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n===Fi){if(t===0){Hn=_n(e.nextSibling);break e}t--}else n!==os&&n!==nr&&n!==dn||t++}e=e.nextSibling}Hn=null}}else Hn=vn?_n(e.stateNode.nextSibling):null;return!0}i(wl,"Wh");function Ys(){Hn=vn=null,gr=!1}i(Ys,"Xh");var Du=_t.ReactCurrentOwner,Xt=!1;function Pt(e,t,n,r){t.child=e===null?Hs(t,null,n,r):Jr(t,e.child,n,r)}i(Pt,"R");function Wa(e,t,n,r,s){n=n.render;var f=t.ref;return Nt(t,s),r=Bs(e,t,n,r,f,s),e!==null&&!Xt?(t.updateQueue=e.updateQueue,t.effectTag&=-517,e.expirationTime<=s&&(e.expirationTime=0),gn(e,t,s)):(t.effectTag|=1,Pt(e,t,r,s),t.child)}i(Wa,"Zh");function qa(e,t,n,r,s,f){if(e===null){var m=n.type;return typeof m=="function"&&!va(m)&&m.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=m,Za(e,t,m,r,s,f)):(e=Al(n.type,null,r,null,t.mode,f),e.ref=t.ref,e.return=t,t.child=e)}return m=e.child,s<f&&(s=m.memoizedProps,n=n.compare,n=n!==null?n:Br,n(s,r)&&e.ref===t.ref)?gn(e,t,f):(t.effectTag|=1,e=kr(m,r),e.ref=t.ref,e.return=t,t.child=e)}i(qa,"ai");function Za(e,t,n,r,s,f){return e!==null&&Br(e.memoizedProps,r)&&e.ref===t.ref&&(Xt=!1,s<f)?(t.expirationTime=e.expirationTime,gn(e,t,f)):Gs(e,t,n,r,f)}i(Za,"ci");function Qa(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.effectTag|=128)}i(Qa,"ei");function Gs(e,t,n,r,s){var f=wt(n)?fn:ft.current;return f=mn(t,f),Nt(t,s),n=Bs(e,t,n,r,f,s),e!==null&&!Xt?(t.updateQueue=e.updateQueue,t.effectTag&=-517,e.expirationTime<=s&&(e.expirationTime=0),gn(e,t,s)):(t.effectTag|=1,Pt(e,t,n,s),t.child)}i(Gs,"di");function Ka(e,t,n,r,s){if(wt(n)){var f=!0;On(t)}else f=!1;if(Nt(t,s),t.stateNode===null)e!==null&&(e.alternate=null,t.alternate=null,t.effectTag|=2),Na(t,n,r),Is(t,n,r,s),r=!0;else if(e===null){var m=t.stateNode,v=t.memoizedProps;m.props=v;var L=m.context,S=n.contextType;typeof S=="object"&&S!==null?S=Ze(S):(S=wt(n)?fn:ft.current,S=mn(t,S));var ne=n.getDerivedStateFromProps,se=typeof ne=="function"||typeof m.getSnapshotBeforeUpdate=="function";se||typeof m.UNSAFE_componentWillReceiveProps!="function"&&typeof m.componentWillReceiveProps!="function"||(v!==r||L!==S)&&Ra(t,m,r,S),it=!1;var Fe=t.memoizedState;m.state=Fe,qo(t,r,m,s),L=t.memoizedState,v!==r||Fe!==L||Ct.current||it?(typeof ne=="function"&&(al(t,n,ne,r),L=t.memoizedState),(v=it||Ma(t,n,v,r,Fe,L,S))?(se||typeof m.UNSAFE_componentWillMount!="function"&&typeof m.componentWillMount!="function"||(typeof m.componentWillMount=="function"&&m.componentWillMount(),typeof m.UNSAFE_componentWillMount=="function"&&m.UNSAFE_componentWillMount()),typeof m.componentDidMount=="function"&&(t.effectTag|=4)):(typeof m.componentDidMount=="function"&&(t.effectTag|=4),t.memoizedProps=r,t.memoizedState=L),m.props=r,m.state=L,m.context=S,r=v):(typeof m.componentDidMount=="function"&&(t.effectTag|=4),r=!1)}else m=t.stateNode,Qe(e,t),v=t.memoizedProps,m.props=t.type===t.elementType?v:xe(t.type,v),L=m.context,S=n.contextType,typeof S=="object"&&S!==null?S=Ze(S):(S=wt(n)?fn:ft.current,S=mn(t,S)),ne=n.getDerivedStateFromProps,(se=typeof ne=="function"||typeof m.getSnapshotBeforeUpdate=="function")||typeof m.UNSAFE_componentWillReceiveProps!="function"&&typeof m.componentWillReceiveProps!="function"||(v!==r||L!==S)&&Ra(t,m,r,S),it=!1,L=t.memoizedState,m.state=L,qo(t,r,m,s),Fe=t.memoizedState,v!==r||L!==Fe||Ct.current||it?(typeof ne=="function"&&(al(t,n,ne,r),Fe=t.memoizedState),(ne=it||Ma(t,n,v,r,L,Fe,S))?(se||typeof m.UNSAFE_componentWillUpdate!="function"&&typeof m.componentWillUpdate!="function"||(typeof m.componentWillUpdate=="function"&&m.componentWillUpdate(r,Fe,S),typeof m.UNSAFE_componentWillUpdate=="function"&&m.UNSAFE_componentWillUpdate(r,Fe,S)),typeof m.componentDidUpdate=="function"&&(t.effectTag|=4),typeof m.getSnapshotBeforeUpdate=="function"&&(t.effectTag|=256)):(typeof m.componentDidUpdate!="function"||v===e.memoizedProps&&L===e.memoizedState||(t.effectTag|=4),typeof m.getSnapshotBeforeUpdate!="function"||v===e.memoizedProps&&L===e.memoizedState||(t.effectTag|=256),t.memoizedProps=r,t.memoizedState=Fe),m.props=r,m.state=Fe,m.context=S,r=ne):(typeof m.componentDidUpdate!="function"||v===e.memoizedProps&&L===e.memoizedState||(t.effectTag|=4),typeof m.getSnapshotBeforeUpdate!="function"||v===e.memoizedProps&&L===e.memoizedState||(t.effectTag|=256),r=!1);return Xs(e,t,n,r,f,s)}i(Ka,"fi");function Xs(e,t,n,r,s,f){Qa(e,t);var m=(t.effectTag&64)!==0;if(!r&&!m)return s&&Zr(t,n,!1),gn(e,t,f);r=t.stateNode,Du.current=t;var v=m&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.effectTag|=1,e!==null&&m?(t.child=Jr(t,e.child,null,f),t.child=Jr(t,null,v,f)):Pt(e,t,v,f),t.memoizedState=r.state,s&&Zr(t,n,!0),t.child}i(Xs,"gi");function Ya(e){var t=e.stateNode;t.pendingContext?qr(e,t.pendingContext,t.pendingContext!==t.context):t.context&&qr(e,t.context,!1),Fs(e,t.containerInfo)}i(Ya,"hi");var Js={dehydrated:null,retryTime:0};function Ga(e,t,n){var r=t.mode,s=t.pendingProps,f=nt.current,m=!1,v;if((v=(t.effectTag&64)!==0)||(v=(f&2)!==0&&(e===null||e.memoizedState!==null)),v?(m=!0,t.effectTag&=-65):e!==null&&e.memoizedState===null||s.fallback===void 0||s.unstable_avoidThisFallback===!0||(f|=1),et(nt,f&1),e===null){if(s.fallback!==void 0&&Ks(t),m){if(m=s.fallback,s=$n(null,r,0,null),s.return=t,!(t.mode&2))for(e=t.memoizedState!==null?t.child.child:t.child,s.child=e;e!==null;)e.return=s,e=e.sibling;return n=$n(m,r,n,null),n.return=t,s.sibling=n,t.memoizedState=Js,t.child=s,n}return r=s.children,t.memoizedState=null,t.child=Hs(t,null,r,n)}if(e.memoizedState!==null){if(e=e.child,r=e.sibling,m){if(s=s.fallback,n=kr(e,e.pendingProps),n.return=t,!(t.mode&2)&&(m=t.memoizedState!==null?t.child.child:t.child,m!==e.child))for(n.child=m;m!==null;)m.return=n,m=m.sibling;return r=kr(r,s),r.return=t,n.sibling=r,n.childExpirationTime=0,t.memoizedState=Js,t.child=n,r}return n=Jr(t,e.child,s.children,n),t.memoizedState=null,t.child=n}if(e=e.child,m){if(m=s.fallback,s=$n(null,r,0,null),s.return=t,s.child=e,e!==null&&(e.return=s),!(t.mode&2))for(e=t.memoizedState!==null?t.child.child:t.child,s.child=e;e!==null;)e.return=s,e=e.sibling;return n=$n(m,r,n,null),n.return=t,s.sibling=n,n.effectTag|=2,s.childExpirationTime=0,t.memoizedState=Js,t.child=s,n}return t.memoizedState=null,t.child=Jr(t,e,s.children,n)}i(Ga,"ji");function Xa(e,t){e.expirationTime<t&&(e.expirationTime=t);var n=e.alternate;n!==null&&n.expirationTime<t&&(n.expirationTime=t),vt(e.return,t)}i(Xa,"ki");function ea(e,t,n,r,s,f){var m=e.memoizedState;m===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailExpiration:0,tailMode:s,lastEffect:f}:(m.isBackwards=t,m.rendering=null,m.renderingStartTime=0,m.last=r,m.tail=n,m.tailExpiration=0,m.tailMode=s,m.lastEffect=f)}i(ea,"li");function Ja(e,t,n){var r=t.pendingProps,s=r.revealOrder,f=r.tail;if(Pt(e,t,r.children,n),r=nt.current,r&2)r=r&1|2,t.effectTag|=64;else{if(e!==null&&e.effectTag&64)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Xa(e,n);else if(e.tag===19)Xa(e,n);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(et(nt,r),!(t.mode&2))t.memoizedState=null;else switch(s){case"forwards":for(n=t.child,s=null;n!==null;)e=n.alternate,e!==null&&fl(e)===null&&(s=n),n=n.sibling;n=s,n===null?(s=t.child,t.child=null):(s=n.sibling,n.sibling=null),ea(t,!1,s,n,f,t.lastEffect);break;case"backwards":for(n=null,s=t.child,t.child=null;s!==null;){if(e=s.alternate,e!==null&&fl(e)===null){t.child=s;break}e=s.sibling,s.sibling=n,n=s,s=e}ea(t,!0,n,null,f,t.lastEffect);break;case"together":ea(t,!1,null,null,void 0,t.lastEffect);break;default:t.memoizedState=null}return t.child}i(Ja,"mi");function gn(e,t,n){e!==null&&(t.dependencies=e.dependencies);var r=t.expirationTime;if(r!==0&&Dl(r),t.childExpirationTime<n)return null;if(e!==null&&t.child!==e.child)throw Error(h(153));if(t.child!==null){for(e=t.child,n=kr(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=kr(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}i(gn,"$h");var eu,ta,tu,nu;eu=i(function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}},"ni"),ta=i(function(){},"oi"),tu=i(function(e,t,n,r,s){var f=e.memoizedProps;if(f!==r){var m=t.stateNode;switch(hr(Gt.current),e=null,n){case"input":f=di(m,f),r=di(m,r),e=[];break;case"option":f=pi(m,f),r=pi(m,r),e=[];break;case"select":f=T({},f,{value:void 0}),r=T({},r,{value:void 0}),e=[];break;case"textarea":f=hi(m,f),r=hi(m,r),e=[];break;default:typeof f.onClick!="function"&&typeof r.onClick=="function"&&(m.onclick=er)}Lo(n,r);var v,L;n=null;for(v in f)if(!r.hasOwnProperty(v)&&f.hasOwnProperty(v)&&f[v]!=null)if(v==="style")for(L in m=f[v],m)m.hasOwnProperty(L)&&(n||(n={}),n[L]="");else v!=="dangerouslySetInnerHTML"&&v!=="children"&&v!=="suppressContentEditableWarning"&&v!=="suppressHydrationWarning"&&v!=="autoFocus"&&(H.hasOwnProperty(v)?e||(e=[]):(e=e||[]).push(v,null));for(v in r){var S=r[v];if(m=f!=null?f[v]:void 0,r.hasOwnProperty(v)&&S!==m&&(S!=null||m!=null))if(v==="style")if(m){for(L in m)!m.hasOwnProperty(L)||S&&S.hasOwnProperty(L)||(n||(n={}),n[L]="");for(L in S)S.hasOwnProperty(L)&&m[L]!==S[L]&&(n||(n={}),n[L]=S[L])}else n||(e||(e=[]),e.push(v,n)),n=S;else v==="dangerouslySetInnerHTML"?(S=S?S.__html:void 0,m=m?m.__html:void 0,S!=null&&m!==S&&(e=e||[]).push(v,S)):v==="children"?m===S||typeof S!="string"&&typeof S!="number"||(e=e||[]).push(v,""+S):v!=="suppressContentEditableWarning"&&v!=="suppressHydrationWarning"&&(H.hasOwnProperty(v)?(S!=null&&Ft(s,v),e||m===S||(e=[])):(e=e||[]).push(v,S))}n&&(e=e||[]).push("style",n),s=e,(t.updateQueue=s)&&(t.effectTag|=4)}},"pi"),nu=i(function(e,t,n,r){n!==r&&(t.effectTag|=4)},"qi");function xl(e,t){switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}i(xl,"ri");function Au(e,t,n){var r=t.pendingProps;switch(t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return null;case 1:return wt(t.type)&&Wr(),null;case 3:return eo(),Ge(Ct),Ge(ft),n=t.stateNode,n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),e!==null&&e.child!==null||!wl(t)||(t.effectTag|=4),ta(t),null;case 5:Vs(t),n=hr(Go.current);var s=t.type;if(e!==null&&t.stateNode!=null)tu(e,t,s,r,n),e.ref!==t.ref&&(t.effectTag|=128);else{if(!r){if(t.stateNode===null)throw Error(h(166));return null}if(e=hr(Gt.current),wl(t)){r=t.stateNode,s=t.type;var f=t.memoizedProps;switch(r[jt]=t,r[Dr]=f,s){case"iframe":case"object":case"embed":Ye("load",r);break;case"video":case"audio":for(e=0;e<Kn.length;e++)Ye(Kn[e],r);break;case"source":Ye("error",r);break;case"img":case"image":case"link":Ye("error",r),Ye("load",r);break;case"form":Ye("reset",r),Ye("submit",r);break;case"details":Ye("toggle",r);break;case"input":Bl(r,f),Ye("invalid",r),Ft(n,"onChange");break;case"select":r._wrapperState={wasMultiple:!!f.multiple},Ye("invalid",r),Ft(n,"onChange");break;case"textarea":vi(r,f),Ye("invalid",r),Ft(n,"onChange")}Lo(s,f),e=null;for(var m in f)if(f.hasOwnProperty(m)){var v=f[m];m==="children"?typeof v=="string"?r.textContent!==v&&(e=["children",v]):typeof v=="number"&&r.textContent!==""+v&&(e=["children",""+v]):H.hasOwnProperty(m)&&v!=null&&Ft(n,m)}switch(s){case"input":St(r),Ul(r,f,!0);break;case"textarea":St(r),yi(r);break;case"select":case"option":break;default:typeof f.onClick=="function"&&(r.onclick=er)}n=e,t.updateQueue=n,n!==null&&(t.effectTag|=4)}else{switch(m=n.nodeType===9?n:n.ownerDocument,e===Ii&&(e=wi(s)),e===Ii?s==="script"?(e=m.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=m.createElement(s,{is:r.is}):(e=m.createElement(s),s==="select"&&(m=e,r.multiple?m.multiple=!0:r.size&&(m.size=r.size))):e=m.createElementNS(e,s),e[jt]=t,e[Dr]=r,eu(e,t,!1,!1),t.stateNode=e,m=So(s,r),s){case"iframe":case"object":case"embed":Ye("load",e),v=r;break;case"video":case"audio":for(v=0;v<Kn.length;v++)Ye(Kn[v],e);v=r;break;case"source":Ye("error",e),v=r;break;case"img":case"image":case"link":Ye("error",e),Ye("load",e),v=r;break;case"form":Ye("reset",e),Ye("submit",e),v=r;break;case"details":Ye("toggle",e),v=r;break;case"input":Bl(e,r),v=di(e,r),Ye("invalid",e),Ft(n,"onChange");break;case"option":v=pi(e,r);break;case"select":e._wrapperState={wasMultiple:!!r.multiple},v=T({},r,{value:void 0}),Ye("invalid",e),Ft(n,"onChange");break;case"textarea":vi(e,r),v=hi(e,r),Ye("invalid",e),Ft(n,"onChange");break;default:v=r}Lo(s,v);var L=v;for(f in L)if(L.hasOwnProperty(f)){var S=L[f];f==="style"?_o(e,S):f==="dangerouslySetInnerHTML"?(S=S?S.__html:void 0,S!=null&&xi(e,S)):f==="children"?typeof S=="string"?(s!=="textarea"||S!=="")&&qn(e,S):typeof S=="number"&&qn(e,""+S):f!=="suppressContentEditableWarning"&&f!=="suppressHydrationWarning"&&f!=="autoFocus"&&(H.hasOwnProperty(f)?S!=null&&Ft(n,f):S!=null&&io(e,f,S,m))}switch(s){case"input":St(e),Ul(e,r,!1);break;case"textarea":St(e),yi(e);break;case"option":r.value!=null&&e.setAttribute("value",""+It(r.value));break;case"select":e.multiple=!!r.multiple,n=r.value,n!=null?Wn(e,!!r.multiple,n,!1):r.defaultValue!=null&&Wn(e,!!r.multiple,r.defaultValue,!0);break;default:typeof v.onClick=="function"&&(e.onclick=er)}Vi(s,r)&&(t.effectTag|=4)}t.ref!==null&&(t.effectTag|=128)}return null;case 6:if(e&&t.stateNode!=null)nu(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(h(166));n=hr(Go.current),hr(Gt.current),wl(t)?(n=t.stateNode,r=t.memoizedProps,n[jt]=t,n.nodeValue!==r&&(t.effectTag|=4)):(n=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),n[jt]=t,t.stateNode=n)}return null;case 13:return Ge(nt),r=t.memoizedState,t.effectTag&64?(t.expirationTime=n,t):(n=r!==null,r=!1,e===null?t.memoizedProps.fallback!==void 0&&wl(t):(s=e.memoizedState,r=s!==null,n||s===null||(s=e.child.sibling,s!==null&&(f=t.firstEffect,f!==null?(t.firstEffect=s,s.nextEffect=f):(t.firstEffect=t.lastEffect=s,s.nextEffect=null),s.effectTag=8))),n&&!r&&t.mode&2&&(e===null&&t.memoizedProps.unstable_avoidThisFallback!==!0||nt.current&1?pt===yr&&(pt=kl):((pt===yr||pt===kl)&&(pt=_l),Jo!==0&&Ot!==null&&(_r(Ot,Lt),Tu(Ot,Jo)))),(n||r)&&(t.effectTag|=4),null);case 4:return eo(),ta(t),null;case 10:return qe(t),null;case 17:return wt(t.type)&&Wr(),null;case 19:if(Ge(nt),r=t.memoizedState,r===null)return null;if(s=(t.effectTag&64)!==0,f=r.rendering,f===null){if(s)xl(r,!1);else if(pt!==yr||e!==null&&e.effectTag&64)for(f=t.child;f!==null;){if(e=fl(f),e!==null){for(t.effectTag|=64,xl(r,!1),s=e.updateQueue,s!==null&&(t.updateQueue=s,t.effectTag|=4),r.lastEffect===null&&(t.firstEffect=null),t.lastEffect=r.lastEffect,r=t.child;r!==null;)s=r,f=n,s.effectTag&=2,s.nextEffect=null,s.firstEffect=null,s.lastEffect=null,e=s.alternate,e===null?(s.childExpirationTime=0,s.expirationTime=f,s.child=null,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null):(s.childExpirationTime=e.childExpirationTime,s.expirationTime=e.expirationTime,s.child=e.child,s.memoizedProps=e.memoizedProps,s.memoizedState=e.memoizedState,s.updateQueue=e.updateQueue,f=e.dependencies,s.dependencies=f===null?null:{expirationTime:f.expirationTime,firstContext:f.firstContext,responders:f.responders}),r=r.sibling;return et(nt,nt.current&1|2),t.child}f=f.sibling}}else{if(!s)if(e=fl(f),e!==null){if(t.effectTag|=64,s=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.effectTag|=4),xl(r,!0),r.tail===null&&r.tailMode==="hidden"&&!f.alternate)return t=t.lastEffect=r.lastEffect,t!==null&&(t.nextEffect=null),null}else 2*x()-r.renderingStartTime>r.tailExpiration&&1<n&&(t.effectTag|=64,s=!0,xl(r,!1),t.expirationTime=t.childExpirationTime=n-1);r.isBackwards?(f.sibling=t.child,t.child=f):(n=r.last,n!==null?n.sibling=f:t.child=f,r.last=f)}return r.tail!==null?(r.tailExpiration===0&&(r.tailExpiration=x()+500),n=r.tail,r.rendering=n,r.tail=n.sibling,r.lastEffect=t.lastEffect,r.renderingStartTime=x(),n.sibling=null,t=nt.current,et(nt,s?t&1|2:t&1),n):null}throw Error(h(156,t.tag))}i(Au,"si");function Iu(e){switch(e.tag){case 1:wt(e.type)&&Wr();var t=e.effectTag;return t&4096?(e.effectTag=t&-4097|64,e):null;case 3:if(eo(),Ge(Ct),Ge(ft),t=e.effectTag,t&64)throw Error(h(285));return e.effectTag=t&-4097|64,e;case 5:return Vs(e),null;case 13:return Ge(nt),t=e.effectTag,t&4096?(e.effectTag=t&-4097|64,e):null;case 19:return Ge(nt),null;case 4:return eo(),null;case 10:return qe(e),null;default:return null}}i(Iu,"zi");function na(e,t){return{value:e,source:t,stack:uo(t)}}i(na,"Ai");var Hu=typeof WeakSet=="function"?WeakSet:Set;function ra(e,t){var n=t.source,r=t.stack;r===null&&n!==null&&(r=uo(n)),n!==null&&At(n.type),t=t.value,e!==null&&e.tag===1&&At(e.type);try{console.error(t)}catch(s){setTimeout(function(){throw s})}}i(ra,"Ci");function Fu(e,t){try{t.props=e.memoizedProps,t.state=e.memoizedState,t.componentWillUnmount()}catch(n){br(e,n)}}i(Fu,"Di");function ru(e){var t=e.ref;if(t!==null)if(typeof t=="function")try{t(null)}catch(n){br(e,n)}else t.current=null}i(ru,"Fi");function Vu(e,t){switch(t.tag){case 0:case 11:case 15:case 22:return;case 1:if(t.effectTag&256&&e!==null){var n=e.memoizedProps,r=e.memoizedState;e=t.stateNode,t=e.getSnapshotBeforeUpdate(t.elementType===t.type?n:xe(t.type,n),r),e.__reactInternalSnapshotBeforeUpdate=t}return;case 3:case 5:case 6:case 4:case 17:return}throw Error(h(163))}i(Vu,"Gi");function ou(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.destroy;n.destroy=void 0,r!==void 0&&r()}n=n.next}while(n!==t)}}i(ou,"Hi");function iu(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}i(iu,"Ii");function $u(e,t,n){switch(n.tag){case 0:case 11:case 15:case 22:iu(3,n);return;case 1:if(e=n.stateNode,n.effectTag&4)if(t===null)e.componentDidMount();else{var r=n.elementType===n.type?t.memoizedProps:xe(n.type,t.memoizedProps);e.componentDidUpdate(r,t.memoizedState,e.__reactInternalSnapshotBeforeUpdate)}t=n.updateQueue,t!==null&&Sa(n,t,e);return;case 3:if(t=n.updateQueue,t!==null){if(e=null,n.child!==null)switch(n.child.tag){case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}Sa(n,t,e)}return;case 5:e=n.stateNode,t===null&&n.effectTag&4&&Vi(n.type,n.memoizedProps)&&e.focus();return;case 6:return;case 4:return;case 12:return;case 13:n.memoizedState===null&&(n=n.alternate,n!==null&&(n=n.memoizedState,n!==null&&(n=n.dehydrated,n!==null&&Xn(n))));return;case 19:case 17:case 20:case 21:return}throw Error(h(163))}i($u,"Ji");function lu(e,t,n){switch(typeof ha=="function"&&ha(t),t.tag){case 0:case 11:case 14:case 15:case 22:if(e=t.updateQueue,e!==null&&(e=e.lastEffect,e!==null)){var r=e.next;F(97<n?97:n,function(){var s=r;do{var f=s.destroy;if(f!==void 0){var m=t;try{f()}catch(v){br(m,v)}}s=s.next}while(s!==r)})}break;case 1:ru(t),n=t.stateNode,typeof n.componentWillUnmount=="function"&&Fu(t,n);break;case 5:ru(t);break;case 4:cu(e,t,n)}}i(lu,"Ki");function su(e){var t=e.alternate;e.return=null,e.child=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.alternate=null,e.firstEffect=null,e.lastEffect=null,e.pendingProps=null,e.memoizedProps=null,e.stateNode=null,t!==null&&su(t)}i(su,"Ni");function au(e){return e.tag===5||e.tag===3||e.tag===4}i(au,"Oi");function uu(e){e:{for(var t=e.return;t!==null;){if(au(t)){var n=t;break e}t=t.return}throw Error(h(160))}switch(t=n.stateNode,n.tag){case 5:var r=!1;break;case 3:t=t.containerInfo,r=!0;break;case 4:t=t.containerInfo,r=!0;break;default:throw Error(h(161))}n.effectTag&16&&(qn(t,""),n.effectTag&=-17);e:t:for(n=e;;){for(;n.sibling===null;){if(n.return===null||au(n.return)){n=null;break e}n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.effectTag&2||n.child===null||n.tag===4)continue t;n.child.return=n,n=n.child}if(!(n.effectTag&2)){n=n.stateNode;break e}}r?oa(e,n,t):ia(e,n,t)}i(uu,"Pi");function oa(e,t,n){var r=e.tag,s=r===5||r===6;if(s)e=s?e.stateNode:e.stateNode.instance,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=er));else if(r!==4&&(e=e.child,e!==null))for(oa(e,t,n),e=e.sibling;e!==null;)oa(e,t,n),e=e.sibling}i(oa,"Qi");function ia(e,t,n){var r=e.tag,s=r===5||r===6;if(s)e=s?e.stateNode:e.stateNode.instance,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(ia(e,t,n),e=e.sibling;e!==null;)ia(e,t,n),e=e.sibling}i(ia,"Ri");function cu(e,t,n){for(var r=t,s=!1,f,m;;){if(!s){s=r.return;e:for(;;){if(s===null)throw Error(h(160));switch(f=s.stateNode,s.tag){case 5:m=!1;break e;case 3:f=f.containerInfo,m=!0;break e;case 4:f=f.containerInfo,m=!0;break e}s=s.return}s=!0}if(r.tag===5||r.tag===6){e:for(var v=e,L=r,S=n,ne=L;;)if(lu(v,ne,S),ne.child!==null&&ne.tag!==4)ne.child.return=ne,ne=ne.child;else{if(ne===L)break e;for(;ne.sibling===null;){if(ne.return===null||ne.return===L)break e;ne=ne.return}ne.sibling.return=ne.return,ne=ne.sibling}m?(v=f,L=r.stateNode,v.nodeType===8?v.parentNode.removeChild(L):v.removeChild(L)):f.removeChild(r.stateNode)}else if(r.tag===4){if(r.child!==null){f=r.stateNode.containerInfo,m=!0,r.child.return=r,r=r.child;continue}}else if(lu(e,r,n),r.child!==null){r.child.return=r,r=r.child;continue}if(r===t)break;for(;r.sibling===null;){if(r.return===null||r.return===t)return;r=r.return,r.tag===4&&(s=!1)}r.sibling.return=r.return,r=r.sibling}}i(cu,"Mi");function la(e,t){switch(t.tag){case 0:case 11:case 14:case 15:case 22:ou(3,t);return;case 1:return;case 5:var n=t.stateNode;if(n!=null){var r=t.memoizedProps,s=e!==null?e.memoizedProps:r;e=t.type;var f=t.updateQueue;if(t.updateQueue=null,f!==null){for(n[Dr]=r,e==="input"&&r.type==="radio"&&r.name!=null&&jl(n,r),So(e,s),t=So(e,r),s=0;s<f.length;s+=2){var m=f[s],v=f[s+1];m==="style"?_o(n,v):m==="dangerouslySetInnerHTML"?xi(n,v):m==="children"?qn(n,v):io(n,m,v,t)}switch(e){case"input":fi(n,r);break;case"textarea":gi(n,r);break;case"select":t=n._wrapperState.wasMultiple,n._wrapperState.wasMultiple=!!r.multiple,e=r.value,e!=null?Wn(n,!!r.multiple,e,!1):t!==!!r.multiple&&(r.defaultValue!=null?Wn(n,!!r.multiple,r.defaultValue,!0):Wn(n,!!r.multiple,r.multiple?[]:"",!1))}}}return;case 6:if(t.stateNode===null)throw Error(h(162));t.stateNode.nodeValue=t.memoizedProps;return;case 3:t=t.stateNode,t.hydrate&&(t.hydrate=!1,Xn(t.containerInfo));return;case 12:return;case 13:if(n=t,t.memoizedState===null?r=!1:(r=!0,n=t.child,ua=x()),n!==null)e:for(e=n;;){if(e.tag===5)f=e.stateNode,r?(f=f.style,typeof f.setProperty=="function"?f.setProperty("display","none","important"):f.display="none"):(f=e.stateNode,s=e.memoizedProps.style,s=s!=null&&s.hasOwnProperty("display")?s.display:null,f.style.display=Ai("display",s));else if(e.tag===6)e.stateNode.nodeValue=r?"":e.memoizedProps;else if(e.tag===13&&e.memoizedState!==null&&e.memoizedState.dehydrated===null){f=e.child.sibling,f.return=e,e=f;continue}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break;for(;e.sibling===null;){if(e.return===null||e.return===n)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}du(t);return;case 19:du(t);return;case 17:return}throw Error(h(163))}i(la,"Si");function du(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new Hu),t.forEach(function(r){var s=Yu.bind(null,e,r);n.has(r)||(n.add(r),r.then(s,s))})}}i(du,"Ui");var zu=typeof WeakMap=="function"?WeakMap:Map;function fu(e,t,n){n=at(n,null),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){Ml||(Ml=!0,ca=r),ra(e,t)},n}i(fu,"Xi");function mu(e,t,n){n=at(n,null),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var s=t.value;n.payload=function(){return ra(e,t),r(s)}}var f=e.stateNode;return f!==null&&typeof f.componentDidCatch=="function"&&(n.callback=function(){typeof r!="function"&&(Fn===null?Fn=new Set([this]):Fn.add(this),ra(e,t));var m=t.stack;this.componentDidCatch(t.value,{componentStack:m!==null?m:""})}),n}i(mu,"$i");var Bu=Math.ceil,El=_t.ReactCurrentDispatcher,pu=_t.ReactCurrentOwner,mt=0,sa=8,Zt=16,Jt=32,yr=0,bl=1,hu=2,kl=3,_l=4,aa=5,Se=mt,Ot=null,Ne=null,Lt=0,pt=yr,Ll=null,yn=1073741823,Xo=1073741823,Sl=null,Jo=0,Tl=!1,ua=0,vu=500,de=null,Ml=!1,ca=null,Fn=null,Nl=!1,ei=null,ti=90,Cr=null,ni=0,da=null,Rl=0;function en(){return(Se&(Zt|Jt))!==mt?1073741821-(x()/10|0):Rl!==0?Rl:Rl=1073741821-(x()/10|0)}i(en,"Gg");function wr(e,t,n){if(t=t.mode,!(t&2))return 1073741823;var r=R();if(!(t&4))return r===99?1073741823:1073741822;if((Se&Zt)!==mt)return Lt;if(n!==null)e=Ce(e,n.timeoutMs|0||5e3,250);else switch(r){case 99:e=1073741823;break;case 98:e=Ce(e,150,100);break;case 97:case 96:e=Ce(e,5e3,250);break;case 95:e=2;break;default:throw Error(h(326))}return Ot!==null&&e===Lt&&--e,e}i(wr,"Hg");function Vn(e,t){if(50<ni)throw ni=0,da=null,Error(h(185));if(e=Pl(e,t),e!==null){var n=R();t===1073741823?(Se&sa)!==mt&&(Se&(Zt|Jt))===mt?fa(e):(Dt(e),Se===mt&&P()):Dt(e),(Se&4)===mt||n!==98&&n!==99||(Cr===null?Cr=new Map([[e,t]]):(n=Cr.get(e),(n===void 0||n>t)&&Cr.set(e,t)))}}i(Vn,"Ig");function Pl(e,t){e.expirationTime<t&&(e.expirationTime=t);var n=e.alternate;n!==null&&n.expirationTime<t&&(n.expirationTime=t);var r=e.return,s=null;if(r===null&&e.tag===3)s=e.stateNode;else for(;r!==null;){if(n=r.alternate,r.childExpirationTime<t&&(r.childExpirationTime=t),n!==null&&n.childExpirationTime<t&&(n.childExpirationTime=t),r.return===null&&r.tag===3){s=r.stateNode;break}r=r.return}return s!==null&&(Ot===s&&(Dl(t),pt===_l&&_r(s,Lt)),Tu(s,t)),s}i(Pl,"xj");function Ol(e){var t=e.lastExpiredTime;if(t!==0||(t=e.firstPendingTime,!Su(e,t)))return t;var n=e.lastPingedTime;return e=e.nextKnownPendingLevel,e=n>e?n:e,2>=e&&t!==e?0:e}i(Ol,"zj");function Dt(e){if(e.lastExpiredTime!==0)e.callbackExpirationTime=1073741823,e.callbackPriority=99,e.callbackNode=me(fa.bind(null,e));else{var t=Ol(e),n=e.callbackNode;if(t===0)n!==null&&(e.callbackNode=null,e.callbackExpirationTime=0,e.callbackPriority=90);else{var r=en();if(t===1073741823?r=99:t===1||t===2?r=95:(r=10*(1073741821-t)-10*(1073741821-r),r=0>=r?99:250>=r?98:5250>=r?97:95),n!==null){var s=e.callbackPriority;if(e.callbackExpirationTime===t&&s>=r)return;n!==a&&Qr(n)}e.callbackExpirationTime=t,e.callbackPriority=r,t=t===1073741823?me(fa.bind(null,e)):le(r,gu.bind(null,e),{timeout:10*(1073741821-t)-x()}),e.callbackNode=t}}}i(Dt,"Z");function gu(e,t){if(Rl=0,t)return t=en(),Ca(e,t),Dt(e),null;var n=Ol(e);if(n!==0){if(t=e.callbackNode,(Se&(Zt|Jt))!==mt)throw Error(h(327));if(ro(),e===Ot&&n===Lt||xr(e,n),Ne!==null){var r=Se;Se|=Zt;var s=xu();do try{Wu();break}catch(v){wu(e,v)}while(!0);if(Ee(),Se=r,El.current=s,pt===bl)throw t=Ll,xr(e,n),_r(e,n),Dt(e),t;if(Ne===null)switch(s=e.finishedWork=e.current.alternate,e.finishedExpirationTime=n,r=pt,Ot=null,r){case yr:case bl:throw Error(h(345));case hu:Ca(e,2<n?2:n);break;case kl:if(_r(e,n),r=e.lastSuspendedTime,n===r&&(e.nextKnownPendingLevel=ma(s)),yn===1073741823&&(s=ua+vu-x(),10<s)){if(Tl){var f=e.lastPingedTime;if(f===0||f>=n){e.lastPingedTime=n,xr(e,n);break}}if(f=Ol(e),f!==0&&f!==n)break;if(r!==0&&r!==n){e.lastPingedTime=r;break}e.timeoutHandle=Do(Er.bind(null,e),s);break}Er(e);break;case _l:if(_r(e,n),r=e.lastSuspendedTime,n===r&&(e.nextKnownPendingLevel=ma(s)),Tl&&(s=e.lastPingedTime,s===0||s>=n)){e.lastPingedTime=n,xr(e,n);break}if(s=Ol(e),s!==0&&s!==n)break;if(r!==0&&r!==n){e.lastPingedTime=r;break}if(Xo!==1073741823?r=10*(1073741821-Xo)-x():yn===1073741823?r=0:(r=10*(1073741821-yn)-5e3,s=x(),n=10*(1073741821-n)-s,r=s-r,0>r&&(r=0),r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Bu(r/1960))-r,n<r&&(r=n)),10<r){e.timeoutHandle=Do(Er.bind(null,e),r);break}Er(e);break;case aa:if(yn!==1073741823&&Sl!==null){f=yn;var m=Sl;if(r=m.busyMinDurationMs|0,0>=r?r=0:(s=m.busyDelayMs|0,f=x()-(10*(1073741821-f)-(m.timeoutMs|0||5e3)),r=f<=s?0:s+r-f),10<r){_r(e,n),e.timeoutHandle=Do(Er.bind(null,e),r);break}}Er(e);break;default:throw Error(h(329))}if(Dt(e),e.callbackNode===t)return gu.bind(null,e)}}return null}i(gu,"Bj");function fa(e){var t=e.lastExpiredTime;if(t=t!==0?t:1073741823,(Se&(Zt|Jt))!==mt)throw Error(h(327));if(ro(),e===Ot&&t===Lt||xr(e,t),Ne!==null){var n=Se;Se|=Zt;var r=xu();do try{Uu();break}catch(s){wu(e,s)}while(!0);if(Ee(),Se=n,El.current=r,pt===bl)throw n=Ll,xr(e,t),_r(e,t),Dt(e),n;if(Ne!==null)throw Error(h(261));e.finishedWork=e.current.alternate,e.finishedExpirationTime=t,Ot=null,Er(e),Dt(e)}return null}i(fa,"yj");function ju(){if(Cr!==null){var e=Cr;Cr=null,e.forEach(function(t,n){Ca(n,t),Dt(n)}),P()}}i(ju,"Lj");function yu(e,t){var n=Se;Se|=1;try{return e(t)}finally{Se=n,Se===mt&&P()}}i(yu,"Mj");function Cu(e,t){var n=Se;Se&=-2,Se|=sa;try{return e(t)}finally{Se=n,Se===mt&&P()}}i(Cu,"Nj");function xr(e,t){e.finishedWork=null,e.finishedExpirationTime=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,is(n)),Ne!==null)for(n=Ne.return;n!==null;){var r=n;switch(r.tag){case 1:r=r.type.childContextTypes,r!=null&&Wr();break;case 3:eo(),Ge(Ct),Ge(ft);break;case 5:Vs(r);break;case 4:eo();break;case 13:Ge(nt);break;case 19:Ge(nt);break;case 10:qe(r)}n=n.return}Ot=e,Ne=kr(e.current,null),Lt=t,pt=yr,Ll=null,Xo=yn=1073741823,Sl=null,Jo=0,Tl=!1}i(xr,"Ej");function wu(e,t){do{try{if(Ee(),ml.current=Cl,pl)for(var n=ut.memoizedState;n!==null;){var r=n.queue;r!==null&&(r.pending=null),n=n.next}if(In=0,Et=xt=ut=null,pl=!1,Ne===null||Ne.return===null)return pt=bl,Ll=t,Ne=null;e:{var s=e,f=Ne.return,m=Ne,v=t;if(t=Lt,m.effectTag|=2048,m.firstEffect=m.lastEffect=null,v!==null&&typeof v=="object"&&typeof v.then=="function"){var L=v;if(!(m.mode&2)){var S=m.alternate;S?(m.updateQueue=S.updateQueue,m.memoizedState=S.memoizedState,m.expirationTime=S.expirationTime):(m.updateQueue=null,m.memoizedState=null)}var ne=(nt.current&1)!==0,se=f;do{var Fe;if(Fe=se.tag===13){var Ue=se.memoizedState;if(Ue!==null)Fe=Ue.dehydrated!==null;else{var zt=se.memoizedProps;Fe=zt.fallback===void 0?!1:zt.unstable_avoidThisFallback!==!0?!0:!ne}}if(Fe){var gt=se.updateQueue;if(gt===null){var b=new Set;b.add(L),se.updateQueue=b}else gt.add(L);if(!(se.mode&2)){if(se.effectTag|=64,m.effectTag&=-2981,m.tag===1)if(m.alternate===null)m.tag=17;else{var E=at(1073741823,null);E.tag=2,qt(m,E)}m.expirationTime=1073741823;break e}v=void 0,m=t;var M=s.pingCache;if(M===null?(M=s.pingCache=new zu,v=new Set,M.set(L,v)):(v=M.get(L),v===void 0&&(v=new Set,M.set(L,v))),!v.has(m)){v.add(m);var W=Ku.bind(null,s,L,m);L.then(W,W)}se.effectTag|=4096,se.expirationTime=t;break e}se=se.return}while(se!==null);v=Error((At(m.type)||"A React component")+` suspended while rendering, but no fallback UI was specified.

Add a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display.`+uo(m))}pt!==aa&&(pt=hu),v=na(v,m),se=f;do{switch(se.tag){case 3:L=v,se.effectTag|=4096,se.expirationTime=t;var te=fu(se,L,t);sl(se,te);break e;case 1:L=v;var ae=se.type,we=se.stateNode;if(!(se.effectTag&64)&&(typeof ae.getDerivedStateFromError=="function"||we!==null&&typeof we.componentDidCatch=="function"&&(Fn===null||!Fn.has(we)))){se.effectTag|=4096,se.expirationTime=t;var $e=mu(se,L,t);sl(se,$e);break e}}se=se.return}while(se!==null)}Ne=ku(Ne)}catch(tt){t=tt;continue}break}while(!0)}i(wu,"Hj");function xu(){var e=El.current;return El.current=Cl,e===null?Cl:e}i(xu,"Fj");function Eu(e,t){e<yn&&2<e&&(yn=e),t!==null&&e<Xo&&2<e&&(Xo=e,Sl=t)}i(Eu,"Ag");function Dl(e){e>Jo&&(Jo=e)}i(Dl,"Bg");function Uu(){for(;Ne!==null;)Ne=bu(Ne)}i(Uu,"Kj");function Wu(){for(;Ne!==null&&!u();)Ne=bu(Ne)}i(Wu,"Gj");function bu(e){var t=Lu(e.alternate,e,Lt);return e.memoizedProps=e.pendingProps,t===null&&(t=ku(e)),pu.current=null,t}i(bu,"Qj");function ku(e){Ne=e;do{var t=Ne.alternate;if(e=Ne.return,Ne.effectTag&2048){if(t=Iu(Ne),t!==null)return t.effectTag&=2047,t;e!==null&&(e.firstEffect=e.lastEffect=null,e.effectTag|=2048)}else{if(t=Au(t,Ne,Lt),Lt===1||Ne.childExpirationTime!==1){for(var n=0,r=Ne.child;r!==null;){var s=r.expirationTime,f=r.childExpirationTime;s>n&&(n=s),f>n&&(n=f),r=r.sibling}Ne.childExpirationTime=n}if(t!==null)return t;e!==null&&!(e.effectTag&2048)&&(e.firstEffect===null&&(e.firstEffect=Ne.firstEffect),Ne.lastEffect!==null&&(e.lastEffect!==null&&(e.lastEffect.nextEffect=Ne.firstEffect),e.lastEffect=Ne.lastEffect),1<Ne.effectTag&&(e.lastEffect!==null?e.lastEffect.nextEffect=Ne:e.firstEffect=Ne,e.lastEffect=Ne))}if(t=Ne.sibling,t!==null)return t;Ne=e}while(Ne!==null);return pt===yr&&(pt=aa),null}i(ku,"Pj");function ma(e){var t=e.expirationTime;return e=e.childExpirationTime,t>e?t:e}i(ma,"Ij");function Er(e){var t=R();return F(99,qu.bind(null,e,t)),null}i(Er,"Jj");function qu(e,t){do ro();while(ei!==null);if((Se&(Zt|Jt))!==mt)throw Error(h(327));var n=e.finishedWork,r=e.finishedExpirationTime;if(n===null)return null;if(e.finishedWork=null,e.finishedExpirationTime=0,n===e.current)throw Error(h(177));e.callbackNode=null,e.callbackExpirationTime=0,e.callbackPriority=90,e.nextKnownPendingLevel=0;var s=ma(n);if(e.firstPendingTime=s,r<=e.lastSuspendedTime?e.firstSuspendedTime=e.lastSuspendedTime=e.nextKnownPendingLevel=0:r<=e.firstSuspendedTime&&(e.firstSuspendedTime=r-1),r<=e.lastPingedTime&&(e.lastPingedTime=0),r<=e.lastExpiredTime&&(e.lastExpiredTime=0),e===Ot&&(Ne=Ot=null,Lt=0),1<n.effectTag?n.lastEffect!==null?(n.lastEffect.nextEffect=n,s=n.firstEffect):s=n:s=n.firstEffect,s!==null){var f=Se;Se|=Jt,pu.current=null,Ro=ko;var m=Hi();if(No(m)){if("selectionStart"in m)var v={start:m.selectionStart,end:m.selectionEnd};else e:{v=(v=m.ownerDocument)&&v.defaultView||window;var L=v.getSelection&&v.getSelection();if(L&&L.rangeCount!==0){v=L.anchorNode;var S=L.anchorOffset,ne=L.focusNode;L=L.focusOffset;try{v.nodeType,ne.nodeType}catch{v=null;break e}var se=0,Fe=-1,Ue=-1,zt=0,gt=0,b=m,E=null;t:for(;;){for(var M;b!==v||S!==0&&b.nodeType!==3||(Fe=se+S),b!==ne||L!==0&&b.nodeType!==3||(Ue=se+L),b.nodeType===3&&(se+=b.nodeValue.length),(M=b.firstChild)!==null;)E=b,b=M;for(;;){if(b===m)break t;if(E===v&&++zt===S&&(Fe=se),E===ne&&++gt===L&&(Ue=se),(M=b.nextSibling)!==null)break;b=E,E=b.parentNode}b=M}v=Fe===-1||Ue===-1?null:{start:Fe,end:Ue}}else v=null}v=v||{start:0,end:0}}else v=null;Po={activeElementDetached:null,focusedElem:m,selectionRange:v},ko=!1,de=s;do try{Zu()}catch(Oe){if(de===null)throw Error(h(330));br(de,Oe),de=de.nextEffect}while(de!==null);de=s;do try{for(m=e,v=t;de!==null;){var W=de.effectTag;if(W&16&&qn(de.stateNode,""),W&128){var te=de.alternate;if(te!==null){var ae=te.ref;ae!==null&&(typeof ae=="function"?ae(null):ae.current=null)}}switch(W&1038){case 2:uu(de),de.effectTag&=-3;break;case 6:uu(de),de.effectTag&=-3,la(de.alternate,de);break;case 1024:de.effectTag&=-1025;break;case 1028:de.effectTag&=-1025,la(de.alternate,de);break;case 4:la(de.alternate,de);break;case 8:S=de,cu(m,S,v),su(S)}de=de.nextEffect}}catch(Oe){if(de===null)throw Error(h(330));br(de,Oe),de=de.nextEffect}while(de!==null);if(ae=Po,te=Hi(),W=ae.focusedElem,v=ae.selectionRange,te!==W&&W&&W.ownerDocument&&Mo(W.ownerDocument.documentElement,W)){for(v!==null&&No(W)&&(te=v.start,ae=v.end,ae===void 0&&(ae=te),"selectionStart"in W?(W.selectionStart=te,W.selectionEnd=Math.min(ae,W.value.length)):(ae=(te=W.ownerDocument||document)&&te.defaultView||window,ae.getSelection&&(ae=ae.getSelection(),S=W.textContent.length,m=Math.min(v.start,S),v=v.end===void 0?m:Math.min(v.end,S),!ae.extend&&m>v&&(S=v,v=m,m=S),S=rs(W,m),ne=rs(W,v),S&&ne&&(ae.rangeCount!==1||ae.anchorNode!==S.node||ae.anchorOffset!==S.offset||ae.focusNode!==ne.node||ae.focusOffset!==ne.offset)&&(te=te.createRange(),te.setStart(S.node,S.offset),ae.removeAllRanges(),m>v?(ae.addRange(te),ae.extend(ne.node,ne.offset)):(te.setEnd(ne.node,ne.offset),ae.addRange(te)))))),te=[],ae=W;ae=ae.parentNode;)ae.nodeType===1&&te.push({element:ae,left:ae.scrollLeft,top:ae.scrollTop});for(typeof W.focus=="function"&&W.focus(),W=0;W<te.length;W++)ae=te[W],ae.element.scrollLeft=ae.left,ae.element.scrollTop=ae.top}ko=!!Ro,Po=Ro=null,e.current=n,de=s;do try{for(W=e;de!==null;){var we=de.effectTag;if(we&36&&$u(W,de.alternate,de),we&128){te=void 0;var $e=de.ref;if($e!==null){var tt=de.stateNode;switch(de.tag){case 5:te=tt;break;default:te=tt}typeof $e=="function"?$e(te):$e.current=te}}de=de.nextEffect}}catch(Oe){if(de===null)throw Error(h(330));br(de,Oe),de=de.nextEffect}while(de!==null);de=null,c(),Se=f}else e.current=n;if(Nl)Nl=!1,ei=e,ti=t;else for(de=s;de!==null;)t=de.nextEffect,de.nextEffect=null,de=t;if(t=e.firstPendingTime,t===0&&(Fn=null),t===1073741823?e===da?ni++:(ni=0,da=e):ni=0,typeof pa=="function"&&pa(n.stateNode,r),Dt(e),Ml)throw Ml=!1,e=ca,ca=null,e;return(Se&sa)!==mt||P(),null}i(qu,"Sj");function Zu(){for(;de!==null;){var e=de.effectTag;e&256&&Vu(de.alternate,de),!(e&512)||Nl||(Nl=!0,le(97,function(){return ro(),null})),de=de.nextEffect}}i(Zu,"Tj");function ro(){if(ti!==90){var e=97<ti?97:ti;return ti=90,F(e,Qu)}}i(ro,"Dj");function Qu(){if(ei===null)return!1;var e=ei;if(ei=null,(Se&(Zt|Jt))!==mt)throw Error(h(331));var t=Se;for(Se|=Jt,e=e.current.firstEffect;e!==null;){try{var n=e;if(n.effectTag&512)switch(n.tag){case 0:case 11:case 15:case 22:ou(5,n),iu(5,n)}}catch(r){if(e===null)throw Error(h(330));br(e,r)}n=e.nextEffect,e.nextEffect=null,e=n}return Se=t,P(),!0}i(Qu,"Vj");function _u(e,t,n){t=na(n,t),t=fu(e,t,1073741823),qt(e,t),e=Pl(e,1073741823),e!==null&&Dt(e)}i(_u,"Wj");function br(e,t){if(e.tag===3)_u(e,e,t);else for(var n=e.return;n!==null;){if(n.tag===3){_u(n,e,t);break}else if(n.tag===1){var r=n.stateNode;if(typeof n.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Fn===null||!Fn.has(r))){e=na(t,e),e=mu(n,e,1073741823),qt(n,e),n=Pl(n,1073741823),n!==null&&Dt(n);break}}n=n.return}}i(br,"Ei");function Ku(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),Ot===e&&Lt===n?pt===_l||pt===kl&&yn===1073741823&&x()-ua<vu?xr(e,Lt):Tl=!0:Su(e,n)&&(t=e.lastPingedTime,t!==0&&t<n||(e.lastPingedTime=n,Dt(e)))}i(Ku,"Oj");function Yu(e,t){var n=e.stateNode;n!==null&&n.delete(t),t=0,t===0&&(t=en(),t=wr(t,e,null)),e=Pl(e,t),e!==null&&Dt(e)}i(Yu,"Vi");var Lu;Lu=i(function(e,t,n){var r=t.expirationTime;if(e!==null){var s=t.pendingProps;if(e.memoizedProps!==s||Ct.current)Xt=!0;else{if(r<n){switch(Xt=!1,t.tag){case 3:Ya(t),Ys();break;case 5:if(Oa(t),t.mode&4&&n!==1&&s.hidden)return t.expirationTime=t.childExpirationTime=1,null;break;case 1:wt(t.type)&&On(t);break;case 4:Fs(t,t.stateNode.containerInfo);break;case 10:r=t.memoizedProps.value,s=t.type._context,et(je,s._currentValue),s._currentValue=r;break;case 13:if(t.memoizedState!==null)return r=t.child.childExpirationTime,r!==0&&r>=n?Ga(e,t,n):(et(nt,nt.current&1),t=gn(e,t,n),t!==null?t.sibling:null);et(nt,nt.current&1);break;case 19:if(r=t.childExpirationTime>=n,e.effectTag&64){if(r)return Ja(e,t,n);t.effectTag|=64}if(s=t.memoizedState,s!==null&&(s.rendering=null,s.tail=null),et(nt,nt.current),!r)return null}return gn(e,t,n)}Xt=!1}}else Xt=!1;switch(t.expirationTime=0,t.tag){case 2:if(r=t.type,e!==null&&(e.alternate=null,t.alternate=null,t.effectTag|=2),e=t.pendingProps,s=mn(t,ft.current),Nt(t,n),s=Bs(null,t,r,e,s,n),t.effectTag|=1,typeof s=="object"&&s!==null&&typeof s.render=="function"&&s.$$typeof===void 0){if(t.tag=1,t.memoizedState=null,t.updateQueue=null,wt(r)){var f=!0;On(t)}else f=!1;t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,An(t);var m=r.getDerivedStateFromProps;typeof m=="function"&&al(t,r,m,e),s.updater=ul,t.stateNode=s,s._reactInternalFiber=t,Is(t,r,e,n),t=Xs(null,t,r,!0,f,n)}else t.tag=0,Pt(null,t,s,n),t=t.child;return t;case 16:e:{if(s=t.elementType,e!==null&&(e.alternate=null,t.alternate=null,t.effectTag|=2),e=t.pendingProps,zl(s),s._status!==1)throw s._result;switch(s=s._result,t.type=s,f=t.tag=Ju(s),e=xe(s,e),f){case 0:t=Gs(null,t,s,e,n);break e;case 1:t=Ka(null,t,s,e,n);break e;case 11:t=Wa(null,t,s,e,n);break e;case 14:t=qa(null,t,s,xe(s.type,e),r,n);break e}throw Error(h(306,s,""))}return t;case 0:return r=t.type,s=t.pendingProps,s=t.elementType===r?s:xe(r,s),Gs(e,t,r,s,n);case 1:return r=t.type,s=t.pendingProps,s=t.elementType===r?s:xe(r,s),Ka(e,t,r,s,n);case 3:if(Ya(t),r=t.updateQueue,e===null||r===null)throw Error(h(282));if(r=t.pendingProps,s=t.memoizedState,s=s!==null?s.element:null,Qe(e,t),qo(t,r,null,n),r=t.memoizedState.element,r===s)Ys(),t=gn(e,t,n);else{if((s=t.stateNode.hydrate)&&(Hn=_n(t.stateNode.containerInfo.firstChild),vn=t,s=gr=!0),s)for(n=Hs(t,null,r,n),t.child=n;n;)n.effectTag=n.effectTag&-3|1024,n=n.sibling;else Pt(e,t,r,n),Ys();t=t.child}return t;case 5:return Oa(t),e===null&&Ks(t),r=t.type,s=t.pendingProps,f=e!==null?e.memoizedProps:null,m=s.children,Oo(r,s)?m=null:f!==null&&Oo(r,f)&&(t.effectTag|=16),Qa(e,t),t.mode&4&&n!==1&&s.hidden?(t.expirationTime=t.childExpirationTime=1,t=null):(Pt(e,t,m,n),t=t.child),t;case 6:return e===null&&Ks(t),null;case 13:return Ga(e,t,n);case 4:return Fs(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Jr(t,null,r,n):Pt(e,t,r,n),t.child;case 11:return r=t.type,s=t.pendingProps,s=t.elementType===r?s:xe(r,s),Wa(e,t,r,s,n);case 7:return Pt(e,t,t.pendingProps,n),t.child;case 8:return Pt(e,t,t.pendingProps.children,n),t.child;case 12:return Pt(e,t,t.pendingProps.children,n),t.child;case 10:e:{r=t.type._context,s=t.pendingProps,m=t.memoizedProps,f=s.value;var v=t.type._context;if(et(je,v._currentValue),v._currentValue=f,m!==null)if(v=m.value,f=Mn(v,f)?0:(typeof r._calculateChangedBits=="function"?r._calculateChangedBits(v,f):1073741823)|0,f===0){if(m.children===s.children&&!Ct.current){t=gn(e,t,n);break e}}else for(v=t.child,v!==null&&(v.return=t);v!==null;){var L=v.dependencies;if(L!==null){m=v.child;for(var S=L.firstContext;S!==null;){if(S.context===r&&S.observedBits&f){v.tag===1&&(S=at(n,null),S.tag=2,qt(v,S)),v.expirationTime<n&&(v.expirationTime=n),S=v.alternate,S!==null&&S.expirationTime<n&&(S.expirationTime=n),vt(v.return,n),L.expirationTime<n&&(L.expirationTime=n);break}S=S.next}}else m=v.tag===10&&v.type===t.type?null:v.child;if(m!==null)m.return=v;else for(m=v;m!==null;){if(m===t){m=null;break}if(v=m.sibling,v!==null){v.return=m.return,m=v;break}m=m.return}v=m}Pt(e,t,s.children,n),t=t.child}return t;case 9:return s=t.type,f=t.pendingProps,r=f.children,Nt(t,n),s=Ze(s,f.unstable_observedBits),r=r(s),t.effectTag|=1,Pt(e,t,r,n),t.child;case 14:return s=t.type,f=xe(s,t.pendingProps),f=xe(s.type,f),qa(e,t,s,f,r,n);case 15:return Za(e,t,t.type,t.pendingProps,r,n);case 17:return r=t.type,s=t.pendingProps,s=t.elementType===r?s:xe(r,s),e!==null&&(e.alternate=null,t.alternate=null,t.effectTag|=2),t.tag=1,wt(r)?(e=!0,On(t)):e=!1,Nt(t,n),Na(t,r,s),Is(t,r,s,n),Xs(null,t,r,!0,e,n);case 19:return Ja(e,t,n)}throw Error(h(156,t.tag))},"Rj");var pa=null,ha=null;function Gu(e){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__=="undefined")return!1;var t=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(t.isDisabled||!t.supportsFiber)return!0;try{var n=t.inject(e);pa=i(function(r){try{t.onCommitFiberRoot(n,r,void 0,(r.current.effectTag&64)===64)}catch{}},"Uj"),ha=i(function(r){try{t.onCommitFiberUnmount(n,r)}catch{}},"Li")}catch{}return!0}i(Gu,"Yj");function Xu(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.effectTag=0,this.lastEffect=this.firstEffect=this.nextEffect=null,this.childExpirationTime=this.expirationTime=0,this.alternate=null}i(Xu,"Zj");function tn(e,t,n,r){return new Xu(e,t,n,r)}i(tn,"Sh");function va(e){return e=e.prototype,!(!e||!e.isReactComponent)}i(va,"bi");function Ju(e){if(typeof e=="function")return va(e)?1:0;if(e!=null){if(e=e.$$typeof,e===lo)return 11;if(e===ao)return 14}return 2}i(Ju,"Xj");function kr(e,t){var n=e.alternate;return n===null?(n=tn(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.effectTag=0,n.nextEffect=null,n.firstEffect=null,n.lastEffect=null),n.childExpirationTime=e.childExpirationTime,n.expirationTime=e.expirationTime,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{expirationTime:t.expirationTime,firstContext:t.firstContext,responders:t.responders},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}i(kr,"Sg");function Al(e,t,n,r,s,f){var m=2;if(r=e,typeof e=="function")va(e)&&(m=1);else if(typeof e=="string")m=5;else e:switch(e){case Qt:return $n(n.children,s,f,t);case Vl:m=8,s|=7;break;case jn:m=8,s|=1;break;case Lr:return e=tn(12,n,t,s|8),e.elementType=Lr,e.type=Lr,e.expirationTime=f,e;case Sr:return e=tn(13,n,t,s),e.type=Sr,e.elementType=Sr,e.expirationTime=f,e;case so:return e=tn(19,n,t,s),e.elementType=so,e.expirationTime=f,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case li:m=10;break e;case si:m=9;break e;case lo:m=11;break e;case ao:m=14;break e;case Tr:m=16,r=null;break e;case $l:m=22;break e}throw Error(h(130,e==null?e:typeof e,""))}return t=tn(m,n,t,s),t.elementType=e,t.type=r,t.expirationTime=f,t}i(Al,"Ug");function $n(e,t,n,r){return e=tn(7,e,r,t),e.expirationTime=n,e}i($n,"Wg");function ga(e,t,n){return e=tn(6,e,null,t),e.expirationTime=n,e}i(ga,"Tg");function ya(e,t,n){return t=tn(4,e.children!==null?e.children:[],e.key,t),t.expirationTime=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}i(ya,"Vg");function ec(e,t,n){this.tag=t,this.current=null,this.containerInfo=e,this.pingCache=this.pendingChildren=null,this.finishedExpirationTime=0,this.finishedWork=null,this.timeoutHandle=-1,this.pendingContext=this.context=null,this.hydrate=n,this.callbackNode=null,this.callbackPriority=90,this.lastExpiredTime=this.lastPingedTime=this.nextKnownPendingLevel=this.lastSuspendedTime=this.firstSuspendedTime=this.firstPendingTime=0}i(ec,"ak");function Su(e,t){var n=e.firstSuspendedTime;return e=e.lastSuspendedTime,n!==0&&n>=t&&e<=t}i(Su,"Aj");function _r(e,t){var n=e.firstSuspendedTime,r=e.lastSuspendedTime;n<t&&(e.firstSuspendedTime=t),(r>t||n===0)&&(e.lastSuspendedTime=t),t<=e.lastPingedTime&&(e.lastPingedTime=0),t<=e.lastExpiredTime&&(e.lastExpiredTime=0)}i(_r,"xi");function Tu(e,t){t>e.firstPendingTime&&(e.firstPendingTime=t);var n=e.firstSuspendedTime;n!==0&&(t>=n?e.firstSuspendedTime=e.lastSuspendedTime=e.nextKnownPendingLevel=0:t>=e.lastSuspendedTime&&(e.lastSuspendedTime=t+1),t>e.nextKnownPendingLevel&&(e.nextKnownPendingLevel=t))}i(Tu,"yi");function Ca(e,t){var n=e.lastExpiredTime;(n===0||n>t)&&(e.lastExpiredTime=t)}i(Ca,"Cj");function Il(e,t,n,r){var s=t.current,f=en(),m=Zo.suspense;f=wr(f,s,m);e:if(n){n=n._reactInternalFiber;t:{if(rn(n)!==n||n.tag!==1)throw Error(h(170));var v=n;do{switch(v.tag){case 3:v=v.stateNode.context;break t;case 1:if(wt(v.type)){v=v.stateNode.__reactInternalMemoizedMergedChildContext;break t}}v=v.return}while(v!==null);throw Error(h(171))}if(n.tag===1){var L=n.type;if(wt(L)){n=pn(n,L,v);break e}}n=v}else n=Yt;return t.context===null?t.context=n:t.pendingContext=n,t=at(f,m),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),qt(s,t),Vn(s,f),f}i(Il,"bk");function wa(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}i(wa,"ck");function Mu(e,t){e=e.memoizedState,e!==null&&e.dehydrated!==null&&e.retryTime<t&&(e.retryTime=t)}i(Mu,"dk");function xa(e,t){Mu(e,t),(e=e.alternate)&&Mu(e,t)}i(xa,"ek");function Ea(e,t,n){n=n!=null&&n.hydrate===!0;var r=new ec(e,t,n),s=tn(3,null,null,t===2?7:t===1?3:0);r.current=s,s.stateNode=r,An(s),e[rr]=r.current,n&&t!==0&&Xl(e,e.nodeType===9?e:e.ownerDocument),this._internalRoot=r}i(Ea,"fk"),Ea.prototype.render=function(e){Il(e,this._internalRoot,null,null)},Ea.prototype.unmount=function(){var e=this._internalRoot,t=e.containerInfo;Il(null,e,null,function(){t[rr]=null})};function ri(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}i(ri,"gk");function tc(e,t){if(t||(t=e?e.nodeType===9?e.documentElement:e.firstChild:null,t=!(!t||t.nodeType!==1||!t.hasAttribute("data-reactroot"))),!t)for(var n;n=e.lastChild;)e.removeChild(n);return new Ea(e,0,t?{hydrate:!0}:void 0)}i(tc,"hk");function Hl(e,t,n,r,s){var f=n._reactRootContainer;if(f){var m=f._internalRoot;if(typeof s=="function"){var v=s;s=i(function(){var S=wa(m);v.call(S)},"e")}Il(t,m,e,s)}else{if(f=n._reactRootContainer=tc(n,r),m=f._internalRoot,typeof s=="function"){var L=s;s=i(function(){var S=wa(m);L.call(S)},"e")}Cu(function(){Il(t,m,e,s)})}return wa(m)}i(Hl,"ik");function nc(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Bn,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}i(nc,"jk"),vo=i(function(e){if(e.tag===13){var t=Ce(en(),150,100);Vn(e,t),xa(e,t)}},"wc"),Yn=i(function(e){e.tag===13&&(Vn(e,3),xa(e,3))},"xc"),Mi=i(function(e){if(e.tag===13){var t=en();t=wr(t,e,null),Vn(e,t),xa(e,t)}},"yc"),pe=i(function(e,t,n){switch(t){case"input":if(fi(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var s=Io(r);if(!s)throw Error(h(90));ci(r),fi(r,s)}}}break;case"textarea":gi(e,n);break;case"select":t=n.value,t!=null&&Wn(e,!!n.multiple,t,!1)}},"za"),Ke=yu,ct=i(function(e,t,n,r,s){var f=Se;Se|=4;try{return F(98,e.bind(null,t,n,r,s))}finally{Se=f,Se===mt&&P()}},"Ga"),yt=i(function(){(Se&(1|Zt|Jt))===mt&&(ju(),ro())},"Ha"),ke=i(function(e,t){var n=Se;Se|=2;try{return e(t)}finally{Se=n,Se===mt&&P()}},"Ia");function Nu(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!ri(t))throw Error(h(200));return nc(e,t,null,n)}i(Nu,"kk");var rc={Events:[ir,Vt,Io,X,D,Ln,function(e){Li(e,Ho)},ze,oe,cn,Rr,ro,{current:!1}]};(function(e){var t=e.findFiberByHostInstance;return Gu(T({},e,{overrideHookState:null,overrideProps:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:_t.ReactCurrentDispatcher,findHostInstanceByFiber:i(function(n){return n=Zl(n),n===null?null:n.stateNode},"findHostInstanceByFiber"),findFiberByHostInstance:i(function(n){return t?t(n):null},"findFiberByHostInstance"),findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null}))})({findFiberByHostInstance:or,bundleType:0,version:"16.14.0",rendererPackageName:"react-dom"}),Y=rc,Y=Nu,Y=i(function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternalFiber;if(t===void 0)throw typeof e.render=="function"?Error(h(188)):Error(h(268,Object.keys(e)));return e=Zl(t),e=e===null?null:e.stateNode,e},"__webpack_unused_export__"),Y=i(function(e,t){if((Se&(Zt|Jt))!==mt)throw Error(h(187));var n=Se;Se|=1;try{return F(99,e.bind(null,t))}finally{Se=n,P()}},"__webpack_unused_export__"),Y=i(function(e,t,n){if(!ri(t))throw Error(h(200));return Hl(null,e,t,!0,n)},"__webpack_unused_export__"),_.render=function(e,t,n){if(!ri(t))throw Error(h(200));return Hl(null,e,t,!1,n)},Y=i(function(e){if(!ri(e))throw Error(h(40));return e._reactRootContainer?(Cu(function(){Hl(null,null,e,!1,function(){e._reactRootContainer=null,e[rr]=null})}),!0):!1},"__webpack_unused_export__"),Y=yu,Y=i(function(e,t){return Nu(e,t,2<arguments.length&&arguments[2]!==void 0?arguments[2]:null)},"__webpack_unused_export__"),Y=i(function(e,t,n,r){if(!ri(n))throw Error(h(200));if(e==null||e._reactInternalFiber===void 0)throw Error(h(38));return Hl(e,t,n,!1,r)},"__webpack_unused_export__"),Y="16.14.0"},961:(k,_,j)=>{"use strict";function Y(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__=="undefined"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Y)}catch($){console.error($)}}i(Y,"checkDCE"),Y(),k.exports=j(2551)},5287:(k,_,j)=>{"use strict";/** @license React v16.14.0
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Y=j(5228),$=typeof Symbol=="function"&&Symbol.for,T=$?Symbol.for("react.element"):60103,g=$?Symbol.for("react.portal"):60106,h=$?Symbol.for("react.fragment"):60107,A=$?Symbol.for("react.strict_mode"):60108,I=$?Symbol.for("react.profiler"):60114,z=$?Symbol.for("react.provider"):60109,V=$?Symbol.for("react.context"):60110,J=$?Symbol.for("react.forward_ref"):60112,G=$?Symbol.for("react.suspense"):60113,De=$?Symbol.for("react.memo"):60115,Ve=$?Symbol.for("react.lazy"):60116,fe=typeof Symbol=="function"&&Symbol.iterator;function Ae(w){for(var O="https://reactjs.org/docs/error-decoder.html?invariant="+w,ve=1;ve<arguments.length;ve++)O+="&args[]="+encodeURIComponent(arguments[ve]);return"Minified React error #"+w+"; visit "+O+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}i(Ae,"C");var rt={isMounted:i(function(){return!1},"isMounted"),enqueueForceUpdate:i(function(){},"enqueueForceUpdate"),enqueueReplaceState:i(function(){},"enqueueReplaceState"),enqueueSetState:i(function(){},"enqueueSetState")},U={};function N(w,O,ve){this.props=w,this.context=O,this.refs=U,this.updater=ve||rt}i(N,"F"),N.prototype.isReactComponent={},N.prototype.setState=function(w,O){if(typeof w!="object"&&typeof w!="function"&&w!=null)throw Error(Ae(85));this.updater.enqueueSetState(this,w,O,"setState")},N.prototype.forceUpdate=function(w){this.updater.enqueueForceUpdate(this,w,"forceUpdate")};function l(){}i(l,"G"),l.prototype=N.prototype;function ie(w,O,ve){this.props=w,this.context=O,this.refs=U,this.updater=ve||rt}i(ie,"H");var Z=ie.prototype=new l;Z.constructor=ie,Y(Z,N.prototype),Z.isPureReactComponent=!0;var q={current:null},D=Object.prototype.hasOwnProperty,H={key:!0,ref:!0,__self:!0,__source:!0};function re(w,O,ve){var Te,_e={},Be=null,bt=null;if(O!=null)for(Te in O.ref!==void 0&&(bt=O.ref),O.key!==void 0&&(Be=""+O.key),O)D.call(O,Te)&&!H.hasOwnProperty(Te)&&(_e[Te]=O[Te]);var Me=arguments.length-2;if(Me===1)_e.children=ve;else if(1<Me){for(var ye=Array(Me),Re=0;Re<Me;Re++)ye[Re]=arguments[Re+2];_e.children=ye}if(w&&w.defaultProps)for(Te in Me=w.defaultProps,Me)_e[Te]===void 0&&(_e[Te]=Me[Te]);return{$$typeof:T,type:w,key:Be,ref:bt,props:_e,_owner:q.current}}i(re,"M");function X(w,O){return{$$typeof:T,type:w.type,key:O,ref:w.ref,props:w.props,_owner:w._owner}}i(X,"N");function ue(w){return typeof w=="object"&&w!==null&&w.$$typeof===T}i(ue,"O");function pe(w){var O={"=":"=0",":":"=2"};return"$"+(""+w).replace(/[=:]/g,function(ve){return O[ve]})}i(pe,"escape");var he=/\/+/g,ge=[];function He(w,O,ve,Te){if(ge.length){var _e=ge.pop();return _e.result=w,_e.keyPrefix=O,_e.func=ve,_e.context=Te,_e.count=0,_e}return{result:w,keyPrefix:O,func:ve,context:Te,count:0}}i(He,"R");function ze(w){w.result=null,w.keyPrefix=null,w.func=null,w.context=null,w.count=0,10>ge.length&&ge.push(w)}i(ze,"S");function oe(w,O,ve,Te){var _e=typeof w;(_e==="undefined"||_e==="boolean")&&(w=null);var Be=!1;if(w===null)Be=!0;else switch(_e){case"string":case"number":Be=!0;break;case"object":switch(w.$$typeof){case T:case g:Be=!0}}if(Be)return ve(Te,w,O===""?"."+ct(w,0):O),1;if(Be=0,O=O===""?".":O+":",Array.isArray(w))for(var bt=0;bt<w.length;bt++){_e=w[bt];var Me=O+ct(_e,bt);Be+=oe(_e,Me,ve,Te)}else if(w===null||typeof w!="object"?Me=null:(Me=fe&&w[fe]||w["@@iterator"],Me=typeof Me=="function"?Me:null),typeof Me=="function")for(w=Me.call(w),bt=0;!(_e=w.next()).done;)_e=_e.value,Me=O+ct(_e,bt++),Be+=oe(_e,Me,ve,Te);else if(_e==="object")throw ve=""+w,Error(Ae(31,ve==="[object Object]"?"object with keys {"+Object.keys(w).join(", ")+"}":ve,""));return Be}i(oe,"T");function Ke(w,O,ve){return w==null?0:oe(w,"",O,ve)}i(Ke,"V");function ct(w,O){return typeof w=="object"&&w!==null&&w.key!=null?pe(w.key):O.toString(36)}i(ct,"U");function yt(w,O){w.func.call(w.context,O,w.count++)}i(yt,"W");function ke(w,O,ve){var Te=w.result,_e=w.keyPrefix;w=w.func.call(w.context,O,w.count++),Array.isArray(w)?We(w,Te,ve,function(Be){return Be}):w!=null&&(ue(w)&&(w=X(w,_e+(!w.key||O&&O.key===w.key?"":(""+w.key).replace(he,"$&/")+"/")+ve)),Te.push(w))}i(ke,"aa");function We(w,O,ve,Te,_e){var Be="";ve!=null&&(Be=(""+ve).replace(he,"$&/")+"/"),O=He(O,Be,Te,_e),Ke(w,ke,O),ze(O)}i(We,"X");var B={current:null};function K(){var w=B.current;if(w===null)throw Error(Ae(321));return w}i(K,"Z");var ce={ReactCurrentDispatcher:B,ReactCurrentBatchConfig:{suspense:null},ReactCurrentOwner:q,IsSomeRendererActing:{current:!1},assign:Y};_.Children={map:i(function(w,O,ve){if(w==null)return w;var Te=[];return We(w,Te,null,O,ve),Te},"map"),forEach:i(function(w,O,ve){if(w==null)return w;O=He(null,null,O,ve),Ke(w,yt,O),ze(O)},"forEach"),count:i(function(w){return Ke(w,function(){return null},null)},"count"),toArray:i(function(w){var O=[];return We(w,O,null,function(ve){return ve}),O},"toArray"),only:i(function(w){if(!ue(w))throw Error(Ae(143));return w},"only")},_.Component=N,_.Fragment=h,_.Profiler=I,_.PureComponent=ie,_.StrictMode=A,_.Suspense=G,_.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ce,_.cloneElement=function(w,O,ve){if(w==null)throw Error(Ae(267,w));var Te=Y({},w.props),_e=w.key,Be=w.ref,bt=w._owner;if(O!=null){if(O.ref!==void 0&&(Be=O.ref,bt=q.current),O.key!==void 0&&(_e=""+O.key),w.type&&w.type.defaultProps)var Me=w.type.defaultProps;for(ye in O)D.call(O,ye)&&!H.hasOwnProperty(ye)&&(Te[ye]=O[ye]===void 0&&Me!==void 0?Me[ye]:O[ye])}var ye=arguments.length-2;if(ye===1)Te.children=ve;else if(1<ye){Me=Array(ye);for(var Re=0;Re<ye;Re++)Me[Re]=arguments[Re+2];Te.children=Me}return{$$typeof:T,type:w.type,key:_e,ref:Be,props:Te,_owner:bt}},_.createContext=function(w,O){return O===void 0&&(O=null),w={$$typeof:V,_calculateChangedBits:O,_currentValue:w,_currentValue2:w,_threadCount:0,Provider:null,Consumer:null},w.Provider={$$typeof:z,_context:w},w.Consumer=w},_.createElement=re,_.createFactory=function(w){var O=re.bind(null,w);return O.type=w,O},_.createRef=function(){return{current:null}},_.forwardRef=function(w){return{$$typeof:J,render:w}},_.isValidElement=ue,_.lazy=function(w){return{$$typeof:Ve,_ctor:w,_status:-1,_result:null}},_.memo=function(w,O){return{$$typeof:De,type:w,compare:O===void 0?null:O}},_.useCallback=function(w,O){return K().useCallback(w,O)},_.useContext=function(w,O){return K().useContext(w,O)},_.useDebugValue=function(){},_.useEffect=function(w,O){return K().useEffect(w,O)},_.useImperativeHandle=function(w,O,ve){return K().useImperativeHandle(w,O,ve)},_.useLayoutEffect=function(w,O){return K().useLayoutEffect(w,O)},_.useMemo=function(w,O){return K().useMemo(w,O)},_.useReducer=function(w,O,ve){return K().useReducer(w,O,ve)},_.useRef=function(w){return K().useRef(w)},_.useState=function(w){return K().useState(w)},_.version="16.14.0"},6540:(k,_,j)=>{"use strict";k.exports=j(5287)},7463:(k,_)=>{"use strict";/** @license React v0.19.1
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var j,Y,$,T,g;if(typeof window=="undefined"||typeof MessageChannel!="function"){var h=null,A=null,I=i(function(){if(h!==null)try{var B=_.unstable_now();h(!0,B),h=null}catch(K){throw setTimeout(I,0),K}},"t"),z=Date.now();_.unstable_now=function(){return Date.now()-z},j=i(function(B){h!==null?setTimeout(j,0,B):(h=B,setTimeout(I,0))},"f"),Y=i(function(B,K){A=setTimeout(B,K)},"g"),$=i(function(){clearTimeout(A)},"h"),T=i(function(){return!1},"k"),g=_.unstable_forceFrameRate=function(){}}else{var V=window.performance,J=window.Date,G=window.setTimeout,De=window.clearTimeout;if(typeof console!="undefined"){var Ve=window.cancelAnimationFrame;typeof window.requestAnimationFrame!="function"&&console.error("This browser doesn't support requestAnimationFrame. Make sure that you load a polyfill in older browsers. https://fb.me/react-polyfills"),typeof Ve!="function"&&console.error("This browser doesn't support cancelAnimationFrame. Make sure that you load a polyfill in older browsers. https://fb.me/react-polyfills")}if(typeof V=="object"&&typeof V.now=="function")_.unstable_now=function(){return V.now()};else{var fe=J.now();_.unstable_now=function(){return J.now()-fe}}var Ae=!1,rt=null,U=-1,N=5,l=0;T=i(function(){return _.unstable_now()>=l},"k"),g=i(function(){},"l"),_.unstable_forceFrameRate=function(B){0>B||125<B?console.error("forceFrameRate takes a positive int between 0 and 125, forcing framerates higher than 125 fps is not unsupported"):N=0<B?Math.floor(1e3/B):5};var ie=new MessageChannel,Z=ie.port2;ie.port1.onmessage=function(){if(rt!==null){var B=_.unstable_now();l=B+N;try{rt(!0,B)?Z.postMessage(null):(Ae=!1,rt=null)}catch(K){throw Z.postMessage(null),K}}else Ae=!1},j=i(function(B){rt=B,Ae||(Ae=!0,Z.postMessage(null))},"f"),Y=i(function(B,K){U=G(function(){B(_.unstable_now())},K)},"g"),$=i(function(){De(U),U=-1},"h")}function q(B,K){var ce=B.length;B.push(K);e:for(;;){var w=ce-1>>>1,O=B[w];if(O!==void 0&&0<re(O,K))B[w]=K,B[ce]=O,ce=w;else break e}}i(q,"J");function D(B){return B=B[0],B===void 0?null:B}i(D,"L");function H(B){var K=B[0];if(K!==void 0){var ce=B.pop();if(ce!==K){B[0]=ce;e:for(var w=0,O=B.length;w<O;){var ve=2*(w+1)-1,Te=B[ve],_e=ve+1,Be=B[_e];if(Te!==void 0&&0>re(Te,ce))Be!==void 0&&0>re(Be,Te)?(B[w]=Be,B[_e]=ce,w=_e):(B[w]=Te,B[ve]=ce,w=ve);else if(Be!==void 0&&0>re(Be,ce))B[w]=Be,B[_e]=ce,w=_e;else break e}}return K}return null}i(H,"M");function re(B,K){var ce=B.sortIndex-K.sortIndex;return ce!==0?ce:B.id-K.id}i(re,"K");var X=[],ue=[],pe=1,he=null,ge=3,He=!1,ze=!1,oe=!1;function Ke(B){for(var K=D(ue);K!==null;){if(K.callback===null)H(ue);else if(K.startTime<=B)H(ue),K.sortIndex=K.expirationTime,q(X,K);else break;K=D(ue)}}i(Ke,"V");function ct(B){if(oe=!1,Ke(B),!ze)if(D(X)!==null)ze=!0,j(yt);else{var K=D(ue);K!==null&&Y(ct,K.startTime-B)}}i(ct,"W");function yt(B,K){ze=!1,oe&&(oe=!1,$()),He=!0;var ce=ge;try{for(Ke(K),he=D(X);he!==null&&(!(he.expirationTime>K)||B&&!T());){var w=he.callback;if(w!==null){he.callback=null,ge=he.priorityLevel;var O=w(he.expirationTime<=K);K=_.unstable_now(),typeof O=="function"?he.callback=O:he===D(X)&&H(X),Ke(K)}else H(X);he=D(X)}if(he!==null)var ve=!0;else{var Te=D(ue);Te!==null&&Y(ct,Te.startTime-K),ve=!1}return ve}finally{he=null,ge=ce,He=!1}}i(yt,"X");function ke(B){switch(B){case 1:return-1;case 2:return 250;case 5:return 1073741823;case 4:return 1e4;default:return 5e3}}i(ke,"Y");var We=g;_.unstable_IdlePriority=5,_.unstable_ImmediatePriority=1,_.unstable_LowPriority=4,_.unstable_NormalPriority=3,_.unstable_Profiling=null,_.unstable_UserBlockingPriority=2,_.unstable_cancelCallback=function(B){B.callback=null},_.unstable_continueExecution=function(){ze||He||(ze=!0,j(yt))},_.unstable_getCurrentPriorityLevel=function(){return ge},_.unstable_getFirstCallbackNode=function(){return D(X)},_.unstable_next=function(B){switch(ge){case 1:case 2:case 3:var K=3;break;default:K=ge}var ce=ge;ge=K;try{return B()}finally{ge=ce}},_.unstable_pauseExecution=function(){},_.unstable_requestPaint=We,_.unstable_runWithPriority=function(B,K){switch(B){case 1:case 2:case 3:case 4:case 5:break;default:B=3}var ce=ge;ge=B;try{return K()}finally{ge=ce}},_.unstable_scheduleCallback=function(B,K,ce){var w=_.unstable_now();if(typeof ce=="object"&&ce!==null){var O=ce.delay;O=typeof O=="number"&&0<O?w+O:w,ce=typeof ce.timeout=="number"?ce.timeout:ke(B)}else ce=ke(B),O=w;return ce=O+ce,B={id:pe++,callback:K,priorityLevel:B,startTime:O,expirationTime:ce,sortIndex:-1},O>w?(B.sortIndex=O,q(ue,B),D(X)===null&&B===D(ue)&&(oe?$():oe=!0,Y(ct,O-w))):(B.sortIndex=ce,q(X,B),ze||He||(ze=!0,j(yt))),B},_.unstable_shouldYield=function(){var B=_.unstable_now();Ke(B);var K=D(X);return K!==he&&he!==null&&K!==null&&K.callback!==null&&K.startTime<=B&&K.expirationTime<he.expirationTime||T()},_.unstable_wrapCallback=function(B){var K=ge;return function(){var ce=ge;ge=K;try{return B.apply(this,arguments)}finally{ge=ce}}}},9982:(k,_,j)=>{"use strict";k.exports=j(7463)},5072:k=>{"use strict";var _=[];function j(T){for(var g=-1,h=0;h<_.length;h++)if(_[h].identifier===T){g=h;break}return g}i(j,"getIndexByIdentifier");function Y(T,g){for(var h={},A=[],I=0;I<T.length;I++){var z=T[I],V=g.base?z[0]+g.base:z[0],J=h[V]||0,G="".concat(V," ").concat(J);h[V]=J+1;var De=j(G),Ve={css:z[1],media:z[2],sourceMap:z[3],supports:z[4],layer:z[5]};if(De!==-1)_[De].references++,_[De].updater(Ve);else{var fe=$(Ve,g);g.byIndex=I,_.splice(I,0,{identifier:G,updater:fe,references:1})}A.push(G)}return A}i(Y,"modulesToDom");function $(T,g){var h=g.domAPI(g);h.update(T);var A=i(function(z){if(z){if(z.css===T.css&&z.media===T.media&&z.sourceMap===T.sourceMap&&z.supports===T.supports&&z.layer===T.layer)return;h.update(T=z)}else h.remove()},"updater");return A}i($,"addElementStyle"),k.exports=function(T,g){g=g||{},T=T||[];var h=Y(T,g);return i(function(I){I=I||[];for(var z=0;z<h.length;z++){var V=h[z],J=j(V);_[J].references--}for(var G=Y(I,g),De=0;De<h.length;De++){var Ve=h[De],fe=j(Ve);_[fe].references===0&&(_[fe].updater(),_.splice(fe,1))}h=G},"update")}},7659:k=>{"use strict";var _={};function j($){if(typeof _[$]=="undefined"){var T=document.querySelector($);if(window.HTMLIFrameElement&&T instanceof window.HTMLIFrameElement)try{T=T.contentDocument.head}catch{T=null}_[$]=T}return _[$]}i(j,"getTarget");function Y($,T){var g=j($);if(!g)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");g.appendChild(T)}i(Y,"insertBySelector"),k.exports=Y},540:k=>{"use strict";function _(j){var Y=document.createElement("style");return j.setAttributes(Y,j.attributes),j.insert(Y,j.options),Y}i(_,"insertStyleElement"),k.exports=_},5056:(k,_,j)=>{"use strict";function Y($){var T=j.nc;T&&$.setAttribute("nonce",T)}i(Y,"setAttributesWithoutAttributes"),k.exports=Y},7825:k=>{"use strict";function _($,T,g){var h="";g.supports&&(h+="@supports (".concat(g.supports,") {")),g.media&&(h+="@media ".concat(g.media," {"));var A=typeof g.layer!="undefined";A&&(h+="@layer".concat(g.layer.length>0?" ".concat(g.layer):""," {")),h+=g.css,A&&(h+="}"),g.media&&(h+="}"),g.supports&&(h+="}");var I=g.sourceMap;I&&typeof btoa!="undefined"&&(h+=`
/*# sourceMappingURL=data:application/json;base64,`.concat(btoa(unescape(encodeURIComponent(JSON.stringify(I))))," */")),T.styleTagTransform(h,$,T.options)}i(_,"apply");function j($){if($.parentNode===null)return!1;$.parentNode.removeChild($)}i(j,"removeStyleElement");function Y($){if(typeof document=="undefined")return{update:i(function(){},"update"),remove:i(function(){},"remove")};var T=$.insertStyleElement($);return{update:i(function(h){_(T,$,h)},"update"),remove:i(function(){j(T)},"remove")}}i(Y,"domAPI"),k.exports=Y},1113:k=>{"use strict";function _(j,Y){if(Y.styleSheet)Y.styleSheet.cssText=j;else{for(;Y.firstChild;)Y.removeChild(Y.firstChild);Y.appendChild(document.createTextNode(j))}}i(_,"styleTagTransform"),k.exports=_},1440:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.12 13.9725L15 12.5L9.37924 2H7.61921L1.99847 12.5L2.87849 13.9725H14.12ZM2.87849 12.9725L8.49922 2.47249L14.12 12.9725H2.87849ZM7.98949 6H8.98799V10H7.98949V6ZM7.98949 11H8.98799V12H7.98949V11Z" fill="#C5C5C5"></path></svg>'},4439:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_818_123307)"><path d="M16 7.99201C16 3.58042 12.416 0 8 0C3.584 0 0 3.58042 0 7.99201C0 10.4216 1.104 12.6114 2.832 14.0819C2.848 14.0979 2.864 14.0979 2.864 14.1139C3.008 14.2258 3.152 14.3377 3.312 14.4496C3.392 14.4975 3.456 14.5614 3.536 14.6254C4.816 15.4885 6.352 16 8.016 16C9.68 16 11.216 15.4885 12.496 14.6254C12.576 14.5774 12.64 14.5135 12.72 14.4655C12.864 14.3536 13.024 14.2418 13.168 14.1299C13.184 14.1139 13.2 14.1139 13.2 14.0979C14.896 12.6114 16 10.4216 16 7.99201ZM8 14.993C6.496 14.993 5.12 14.5135 3.984 13.7143C4 13.5864 4.032 13.4585 4.064 13.3307C4.16 12.979 4.304 12.6434 4.48 12.3397C4.656 12.036 4.864 11.7642 5.12 11.5245C5.36 11.2847 5.648 11.0609 5.936 10.8851C6.24 10.7093 6.56 10.5814 6.912 10.4855C7.264 10.3896 7.632 10.3417 8 10.3417C8.592 10.3417 9.136 10.4535 9.632 10.6613C10.128 10.8691 10.56 11.1568 10.928 11.5085C11.296 11.8761 11.584 12.3077 11.792 12.8032C11.904 13.0909 11.984 13.3946 12.032 13.7143C10.88 14.5135 9.504 14.993 8 14.993ZM5.552 7.59241C5.408 7.27273 5.344 6.92108 5.344 6.56943C5.344 6.21778 5.408 5.86613 5.552 5.54645C5.696 5.22677 5.888 4.93906 6.128 4.6993C6.368 4.45954 6.656 4.26773 6.976 4.12388C7.296 3.98002 7.648 3.91608 8 3.91608C8.368 3.91608 8.704 3.98002 9.024 4.12388C9.344 4.26773 9.632 4.45954 9.872 4.6993C10.112 4.93906 10.304 5.22677 10.448 5.54645C10.592 5.86613 10.656 6.21778 10.656 6.56943C10.656 6.93706 10.592 7.27273 10.448 7.59241C10.304 7.91209 10.112 8.1998 9.872 8.43956C9.632 8.67932 9.344 8.87113 9.024 9.01499C8.384 9.28671 7.6 9.28671 6.96 9.01499C6.64 8.87113 6.352 8.67932 6.112 8.43956C5.872 8.1998 5.68 7.91209 5.552 7.59241ZM12.976 12.8991C12.976 12.8671 12.96 12.8511 12.96 12.8192C12.8 12.3237 12.576 11.8442 12.272 11.4126C11.968 10.981 11.616 10.5974 11.184 10.2777C10.864 10.038 10.512 9.83017 10.144 9.67033C10.32 9.55844 10.48 9.41459 10.608 9.28671C10.848 9.04695 11.056 8.79121 11.232 8.5035C11.408 8.21578 11.536 7.91209 11.632 7.57642C11.728 7.24076 11.76 6.90509 11.76 6.56943C11.76 6.04196 11.664 5.54645 11.472 5.0989C11.28 4.65135 11.008 4.25175 10.656 3.9001C10.32 3.56444 9.904 3.29271 9.456 3.1009C9.008 2.90909 8.512 2.81319 7.984 2.81319C7.456 2.81319 6.96 2.90909 6.512 3.1009C6.064 3.29271 5.648 3.56444 5.312 3.91608C4.976 4.25175 4.704 4.66733 4.512 5.11489C4.32 5.56244 4.224 6.05794 4.224 6.58541C4.224 6.93706 4.272 7.27273 4.368 7.59241C4.464 7.92807 4.592 8.23177 4.768 8.51948C4.928 8.80719 5.152 9.06294 5.392 9.3027C5.536 9.44655 5.696 9.57443 5.872 9.68631C5.488 9.86214 5.136 10.0699 4.832 10.3097C4.416 10.6294 4.048 11.013 3.744 11.4286C3.44 11.8601 3.216 12.3237 3.056 12.8352C3.04 12.8671 3.04 12.8991 3.04 12.9151C1.776 11.6364 0.992 9.91009 0.992 7.99201C0.992 4.13986 4.144 0.991009 8 0.991009C11.856 0.991009 15.008 4.13986 15.008 7.99201C15.008 9.91009 14.224 11.6364 12.976 12.8991Z" fill="#C5C5C5"></path></g><defs><clipPath id="clip0_818_123307"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>'},4894:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" fill="#C5C5C5"></path></svg>'},407:k=>{k.exports='<svg viewBox="0 -2 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.97612 10.0719L12.3334 5.7146L12.9521 6.33332L8.28548 11L7.66676 11L3.0001 6.33332L3.61882 5.7146L7.97612 10.0719Z" fill="#C5C5C5"></path></svg>'},650:k=>{k.exports='<svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.97612 10.0719L12.3334 5.7146L12.9521 6.33332L8.28548 11L7.66676 11L3.0001 6.33332L3.61882 5.7146L7.97612 10.0719Z"></path></svg>'},5130:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.99998 8.70711L11.6464 12.3536L12.3535 11.6464L8.70708 8L12.3535 4.35355L11.6464 3.64645L7.99998 7.29289L4.35353 3.64645L3.64642 4.35355L7.29287 8L3.64642 11.6464L4.35353 12.3536L7.99998 8.70711Z" fill="#C5C5C5"></path></svg>'},2301:k=>{k.exports='<svg viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M14 1H2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2v3.5L7.5 11H14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 9H7l-2 2v-2H2V2h12v8z"></path></svg>'},5771:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.52 0H8.48V4.05333C9.47556 4.16 10.3111 4.58667 10.9867 5.33333C11.6622 6.08 12 6.96889 12 8C12 9.03111 11.6622 9.92 10.9867 10.6667C10.3111 11.4133 9.47556 11.84 8.48 11.9467V16H7.52V11.9467C6.52444 11.84 5.68889 11.4133 5.01333 10.6667C4.33778 9.92 4 9.03111 4 8C4 6.96889 4.33778 6.08 5.01333 5.33333C5.68889 4.58667 6.52444 4.16 7.52 4.05333V0ZM8 10.6133C8.71111 10.6133 9.31556 10.3644 9.81333 9.86667C10.3467 9.33333 10.6133 8.71111 10.6133 8C10.6133 7.28889 10.3467 6.68444 9.81333 6.18667C9.31556 5.65333 8.71111 5.38667 8 5.38667C7.28889 5.38667 6.66667 5.65333 6.13333 6.18667C5.63556 6.68444 5.38667 7.28889 5.38667 8C5.38667 8.71111 5.63556 9.33333 6.13333 9.86667C6.66667 10.3644 7.28889 10.6133 8 10.6133Z" fill="#A0A0A0"></path></svg>'},4339:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.807 2.265C13.228 1.532 12.313 1.141 11.083 1.004C9.877 0.870002 8.821 1.038 8.139 1.769C8.09 1.822 8.043 1.877 8 1.933C7.957 1.877 7.91 1.822 7.861 1.769C7.179 1.038 6.123 0.870002 4.917 1.004C3.687 1.141 2.772 1.532 2.193 2.265C1.628 2.981 1.5 3.879 1.5 4.75C1.5 5.322 1.553 5.897 1.754 6.405L1.586 7.243L1.52 7.276C0.588 7.742 0 8.694 0 9.736V11C0 11.24 0.086 11.438 0.156 11.567C0.231 11.704 0.325 11.828 0.415 11.933C0.595 12.143 0.819 12.346 1.02 12.513C1.225 12.684 1.427 12.836 1.577 12.943C1.816 13.116 2.062 13.275 2.318 13.423C2.625 13.6 3.066 13.832 3.614 14.065C4.391 14.395 5.404 14.722 6.553 14.887C6.203 14.377 5.931 13.809 5.751 13.202C5.173 13.055 4.645 12.873 4.201 12.684C3.717 12.479 3.331 12.274 3.067 12.123L3.002 12.085V7.824L3.025 7.709C3.515 7.919 4.1 8 4.752 8C5.898 8 6.812 7.672 7.462 7.009C7.681 6.785 7.859 6.535 8.002 6.266C8.049 6.354 8.106 6.436 8.16 6.52C8.579 6.238 9.038 6.013 9.522 5.843C9.26 5.52 9.077 5.057 8.996 4.407C8.879 3.471 9.034 3.011 9.238 2.793C9.431 2.586 9.875 2.379 10.919 2.495C11.939 2.608 12.398 2.899 12.632 3.195C12.879 3.508 13.002 3.984 13.002 4.75C13.002 5.158 12.967 5.453 12.909 5.674C13.398 5.792 13.865 5.967 14.3 6.197C14.443 5.741 14.502 5.248 14.502 4.75C14.502 3.879 14.374 2.981 13.809 2.265H13.807ZM7.006 4.407C6.915 5.133 6.704 5.637 6.388 5.959C6.089 6.264 5.604 6.5 4.75 6.5C3.828 6.5 3.47 6.301 3.308 6.12C3.129 5.92 3 5.542 3 4.75C3 3.984 3.123 3.508 3.37 3.195C3.604 2.899 4.063 2.609 5.083 2.495C6.127 2.379 6.571 2.586 6.764 2.793C6.968 3.011 7.123 3.471 7.006 4.407Z" fill="currentColor"></path><path d="M11.5 7C9.015 7 7 9.015 7 11.5C7 13.985 9.015 16 11.5 16C13.985 16 16 13.985 16 11.5C16 9.015 13.985 7 11.5 7ZM13.854 13.146L13.147 13.853L11.501 12.207L9.855 13.853L9.148 13.146L10.794 11.5L9.148 9.854L9.855 9.147L11.501 10.793L13.147 9.147L13.854 9.854L12.208 11.5L13.854 13.146Z" fill="var(--vscode-list-errorForeground, currentColor)"></path></svg>'},8726:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.807 2.265C13.228 1.532 12.313 1.141 11.083 1.004C9.877 0.870002 8.821 1.038 8.139 1.769C8.09 1.822 8.043 1.877 8 1.933C7.957 1.877 7.91 1.822 7.861 1.769C7.179 1.038 6.123 0.870002 4.917 1.004C3.687 1.141 2.772 1.532 2.193 2.265C1.628 2.981 1.5 3.879 1.5 4.75C1.5 5.322 1.553 5.897 1.754 6.405L1.586 7.243L1.52 7.276C0.588 7.742 0 8.694 0 9.736V11C0 11.24 0.086 11.438 0.156 11.567C0.231 11.704 0.325 11.828 0.415 11.933C0.595 12.143 0.819 12.346 1.02 12.513C1.225 12.684 1.427 12.836 1.577 12.943C1.816 13.116 2.062 13.275 2.318 13.423C2.625 13.6 3.066 13.832 3.614 14.065C4.391 14.395 5.404 14.722 6.553 14.887C6.203 14.377 5.931 13.809 5.751 13.202C5.173 13.055 4.645 12.873 4.201 12.684C3.717 12.479 3.331 12.274 3.067 12.123L3.002 12.085V7.824L3.025 7.709C3.515 7.919 4.1 8 4.752 8C5.898 8 6.812 7.672 7.462 7.009C7.681 6.785 7.859 6.535 8.002 6.266C8.049 6.354 8.106 6.436 8.16 6.52C8.579 6.238 9.038 6.013 9.522 5.843C9.26 5.52 9.077 5.057 8.996 4.407C8.879 3.471 9.034 3.011 9.238 2.793C9.431 2.586 9.875 2.379 10.919 2.495C11.939 2.608 12.398 2.899 12.632 3.195C12.879 3.508 13.002 3.984 13.002 4.75C13.002 5.158 12.967 5.453 12.909 5.674C13.398 5.792 13.865 5.967 14.3 6.197C14.443 5.741 14.502 5.248 14.502 4.75C14.502 3.879 14.374 2.981 13.809 2.265H13.807ZM7.006 4.407C6.915 5.133 6.704 5.637 6.388 5.959C6.089 6.264 5.604 6.5 4.75 6.5C3.828 6.5 3.47 6.301 3.308 6.12C3.129 5.92 3 5.542 3 4.75C3 3.984 3.123 3.508 3.37 3.195C3.604 2.899 4.063 2.609 5.083 2.495C6.127 2.379 6.571 2.586 6.764 2.793C6.968 3.011 7.123 3.471 7.006 4.407Z" fill="currentColor"></path><path d="M11.5 7C9.015 7 7 9.015 7 11.5C7 13.985 9.015 16 11.5 16C13.985 16 16 13.985 16 11.5C16 9.015 13.985 7 11.5 7ZM11.5 14.25C10.963 14.25 10.445 14.105 10 13.844V14.5H9V12.5L9.5 12H11.5V13H10.536C10.823 13.16 11.155 13.25 11.5 13.25C12.177 13.25 12.805 12.907 13.137 12.354L13.994 12.87C13.481 13.722 12.525 14.25 11.5 14.25ZM14 10.5L13.5 11H11.5V10H12.464C12.177 9.84 11.845 9.75 11.5 9.75C10.823 9.75 10.195 10.093 9.863 10.646L9.006 10.13C9.519 9.278 10.475 8.75 11.5 8.75C12.037 8.75 12.555 8.895 13 9.156V8.5H14V10.5Z" fill="var(--vscode-editorWarning-foreground, currentColor)"></path></svg>'},9336:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.807 2.265C13.228 1.532 12.313 1.141 11.083 1.004C9.877 0.870002 8.821 1.038 8.139 1.769C8.09 1.822 8.043 1.877 8 1.933C7.957 1.877 7.91 1.822 7.861 1.769C7.179 1.038 6.123 0.870002 4.917 1.004C3.687 1.141 2.772 1.532 2.193 2.265C1.628 2.981 1.5 3.879 1.5 4.75C1.5 5.322 1.553 5.897 1.754 6.405L1.586 7.243L1.52 7.276C0.588 7.742 0 8.694 0 9.736V11C0 11.24 0.086 11.438 0.156 11.567C0.231 11.704 0.325 11.828 0.415 11.933C0.595 12.143 0.819 12.346 1.02 12.513C1.225 12.684 1.427 12.836 1.577 12.943C1.816 13.116 2.062 13.275 2.318 13.423C2.625 13.6 3.066 13.832 3.614 14.065C4.391 14.395 5.404 14.722 6.553 14.887C6.203 14.377 5.931 13.809 5.751 13.202C5.173 13.055 4.645 12.873 4.201 12.684C3.717 12.479 3.331 12.274 3.067 12.123L3.002 12.085V7.824L3.025 7.709C3.515 7.919 4.1 8 4.752 8C5.898 8 6.812 7.672 7.462 7.009C7.681 6.785 7.859 6.535 8.002 6.266C8.049 6.354 8.106 6.436 8.16 6.52C8.579 6.238 9.038 6.013 9.522 5.843C9.26 5.52 9.077 5.057 8.996 4.407C8.879 3.471 9.034 3.011 9.238 2.793C9.431 2.586 9.875 2.379 10.919 2.495C11.939 2.608 12.398 2.899 12.632 3.195C12.879 3.508 13.002 3.984 13.002 4.75C13.002 5.158 12.967 5.453 12.909 5.674C13.398 5.792 13.865 5.967 14.3 6.197C14.443 5.741 14.502 5.248 14.502 4.75C14.502 3.879 14.374 2.981 13.809 2.265H13.807ZM7.006 4.407C6.915 5.133 6.704 5.637 6.388 5.959C6.089 6.264 5.604 6.5 4.75 6.5C3.828 6.5 3.47 6.301 3.308 6.12C3.129 5.92 3 5.542 3 4.75C3 3.984 3.123 3.508 3.37 3.195C3.604 2.899 4.063 2.609 5.083 2.495C6.127 2.379 6.571 2.586 6.764 2.793C6.968 3.011 7.123 3.471 7.006 4.407Z" fill="currentColor"></path><path d="M11.5 7C9.015 7 7 9.015 7 11.5C7 13.985 9.015 16 11.5 16C13.985 16 16 13.985 16 11.5C16 9.015 13.985 7 11.5 7ZM11.393 13.309L10.7 13.401L8.7 11.901L9.3 11.1L10.909 12.307L13.357 9.192L14.143 9.809L11.393 13.309Z" fill="var(--vscode-notebookStatusSuccessIcon-foreground, currentColor)"></path></svg>'},2158:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M6.25 9.016C6.66421 9.016 7 9.35089 7 9.76399V11.26C7 11.6731 6.66421 12.008 6.25 12.008C5.83579 12.008 5.5 11.6731 5.5 11.26V9.76399C5.5 9.35089 5.83579 9.016 6.25 9.016Z"></path><path d="M10.5 9.76399C10.5 9.35089 10.1642 9.016 9.75 9.016C9.33579 9.016 9 9.35089 9 9.76399V11.26C9 11.6731 9.33579 12.008 9.75 12.008C10.1642 12.008 10.5 11.6731 10.5 11.26V9.76399Z"></path><path d="M7.86079 1.80482C7.91028 1.8577 7.95663 1.91232 8 1.96856C8.04337 1.91232 8.08972 1.8577 8.13921 1.80482C8.82116 1.07611 9.87702 0.90832 11.0828 1.04194C12.3131 1.17827 13.2283 1.56829 13.8072 2.29916C14.3725 3.01276 14.5 3.90895 14.5 4.77735C14.5 5.34785 14.447 5.92141 14.2459 6.428L14.4135 7.26391L14.4798 7.29699C15.4115 7.76158 16 8.71126 16 9.7501V11.0107C16 11.2495 15.9143 11.4478 15.844 11.5763C15.7691 11.7131 15.6751 11.8368 15.5851 11.9416C15.4049 12.1512 15.181 12.3534 14.9801 12.5202C14.7751 12.6907 14.5728 12.8419 14.4235 12.9494C14.1842 13.1217 13.9389 13.2807 13.6826 13.4277C13.3756 13.6038 12.9344 13.8361 12.3867 14.0679C11.2956 14.5296 9.75604 15 8 15C6.24396 15 4.70442 14.5296 3.61334 14.0679C3.06559 13.8361 2.62435 13.6038 2.31739 13.4277C2.0611 13.2807 1.81581 13.1217 1.57651 12.9494C1.42716 12.8419 1.2249 12.6907 1.01986 12.5202C0.819 12.3534 0.595113 12.1512 0.414932 11.9416C0.3249 11.8368 0.230849 11.7131 0.156031 11.5763C0.0857453 11.4478 0 11.2495 1.90735e-06 11.0107L0 9.7501C0 8.71126 0.588507 7.76158 1.52017 7.29699L1.5865 7.26391L1.75413 6.42799C1.55295 5.9214 1.5 5.34785 1.5 4.77735C1.5 3.90895 1.62745 3.01276 2.19275 2.29916C2.77172 1.56829 3.68694 1.17827 4.91718 1.04194C6.12298 0.90832 7.17884 1.07611 7.86079 1.80482ZM3.0231 7.7282L3 7.8434V12.0931C3.02086 12.1053 3.04268 12.1179 3.06543 12.131C3.32878 12.2821 3.71567 12.4861 4.19916 12.6907C5.17058 13.1017 6.50604 13.504 8 13.504C9.49396 13.504 10.8294 13.1017 11.8008 12.6907C12.2843 12.4861 12.6712 12.2821 12.9346 12.131C12.9573 12.1179 12.9791 12.1053 13 12.0931V7.8434L12.9769 7.7282C12.4867 7.93728 11.9022 8.01867 11.25 8.01867C10.1037 8.01867 9.19051 7.69201 8.54033 7.03004C8.3213 6.80703 8.14352 6.55741 8 6.28924C7.85648 6.55741 7.6787 6.80703 7.45967 7.03004C6.80949 7.69201 5.89633 8.01867 4.75 8.01867C4.09776 8.01867 3.51325 7.93728 3.0231 7.7282ZM6.76421 2.82557C6.57116 2.61928 6.12702 2.41307 5.08282 2.52878C4.06306 2.64179 3.60328 2.93176 3.36975 3.22656C3.12255 3.53861 3 4.01374 3 4.77735C3 5.56754 3.12905 5.94499 3.3082 6.1441C3.47045 6.32443 3.82768 6.52267 4.75 6.52267C5.60367 6.52267 6.08903 6.28769 6.38811 5.98319C6.70349 5.66209 6.91507 5.1591 7.00579 4.43524C7.12274 3.50212 6.96805 3.04338 6.76421 2.82557ZM9.23579 2.82557C9.03195 3.04338 8.87726 3.50212 8.99421 4.43524C9.08493 5.1591 9.29651 5.66209 9.61189 5.98319C9.91097 6.28769 10.3963 6.52267 11.25 6.52267C12.1723 6.52267 12.5295 6.32443 12.6918 6.1441C12.871 5.94499 13 5.56754 13 4.77735C13 4.01374 12.8775 3.53861 12.6303 3.22656C12.3967 2.93176 11.9369 2.64179 10.9172 2.52878C9.87298 2.41307 9.42884 2.61928 9.23579 2.82557Z"></path></svg>'},7165:k=>{k.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M5.75 1a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-4.5zm.75 3V2.5h3V4h-3zm-2.874-.467a.75.75 0 00-.752-1.298A1.75 1.75 0 002 3.75v9.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-9.5a1.75 1.75 0 00-.874-1.515.75.75 0 10-.752 1.298.25.25 0 01.126.217v9.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-9.5a.25.25 0 01.126-.217z"></path></svg>'},8440:k=>{k.exports='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 28 28" version="1.1"><g id="surface1"><path style=" stroke:none;fill-rule:evenodd;fill:#FFFFFF;fill-opacity:1;" d="M 14 0 C 6.265625 0 0 6.265625 0 14 C 0 20.195312 4.007812 25.425781 9.574219 27.285156 C 10.273438 27.402344 10.535156 26.984375 10.535156 26.617188 C 10.535156 26.285156 10.515625 25.183594 10.515625 24.011719 C 7 24.660156 6.089844 23.152344 5.808594 22.363281 C 5.652344 21.960938 4.972656 20.722656 4.375 20.386719 C 3.886719 20.125 3.183594 19.476562 4.359375 19.460938 C 5.460938 19.441406 6.246094 20.476562 6.511719 20.894531 C 7.769531 23.011719 9.785156 22.417969 10.585938 22.050781 C 10.710938 21.140625 11.078125 20.527344 11.480469 20.175781 C 8.363281 19.828125 5.109375 18.621094 5.109375 13.265625 C 5.109375 11.742188 5.652344 10.484375 6.546875 9.503906 C 6.402344 9.152344 5.914062 7.714844 6.683594 5.792969 C 6.683594 5.792969 7.859375 5.425781 10.535156 7.226562 C 11.652344 6.914062 12.847656 6.753906 14.035156 6.753906 C 15.226562 6.753906 16.414062 6.914062 17.535156 7.226562 C 20.210938 5.410156 21.386719 5.792969 21.386719 5.792969 C 22.152344 7.714844 21.664062 9.152344 21.523438 9.503906 C 22.417969 10.484375 22.960938 11.726562 22.960938 13.265625 C 22.960938 18.636719 19.6875 19.828125 16.574219 20.175781 C 17.078125 20.613281 17.515625 21.453125 17.515625 22.765625 C 17.515625 24.640625 17.5 26.144531 17.5 26.617188 C 17.5 26.984375 17.761719 27.421875 18.460938 27.285156 C 24.160156 25.359375 27.996094 20.015625 28 14 C 28 6.265625 21.734375 0 14 0 Z M 14 0 "></path></g></svg>'},6279:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z" fill="#cccccc"></path></svg>'},9443:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 4C8.35556 4 8.71111 4.05333 9.06667 4.16C9.74222 4.33778 10.3289 4.67556 10.8267 5.17333C11.3244 5.67111 11.6622 6.25778 11.84 6.93333C11.9467 7.28889 12 7.64444 12 8C12 8.35556 11.9467 8.71111 11.84 9.06667C11.6622 9.74222 11.3244 10.3289 10.8267 10.8267C10.3289 11.3244 9.74222 11.6622 9.06667 11.84C8.71111 11.9467 8.35556 12 8 12C7.64444 12 7.28889 11.9467 6.93333 11.84C6.25778 11.6622 5.67111 11.3244 5.17333 10.8267C4.67556 10.3289 4.33778 9.74222 4.16 9.06667C4.05333 8.71111 4 8.35556 4 8C4 7.64444 4.03556 7.30667 4.10667 6.98667C4.21333 6.63111 4.35556 6.29333 4.53333 5.97333C4.88889 5.36889 5.36889 4.88889 5.97333 4.53333C6.29333 4.35556 6.61333 4.23111 6.93333 4.16C7.28889 4.05333 7.64444 4 8 4Z" fill="#CCCCCC"></path></svg>'},3962:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.40706 15L1 13.5929L3.35721 9.46781L3.52339 9.25025L11.7736 1L13.2321 1L15 2.76791V4.22636L6.74975 12.4766L6.53219 12.6428L2.40706 15ZM2.40706 13.5929L6.02053 11.7474L14.2708 3.49714L12.5029 1.72923L4.25262 9.97947L2.40706 13.5929Z" fill="#C5C5C5"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.64642 12.3536L3.64642 10.3536L4.35353 9.64645L6.35353 11.6464L5.64642 12.3536Z" fill="#C5C5C5"></path></svg>'},3492:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6zM7.9 7.5L10.3 5l.7.7-2.4 2.5 2.4 2.5-.7.7-2.4-2.5-2.4 2.5-.7-.7 2.4-2.5-2.4-2.5.7-.7 2.4 2.5z"></path></svg>'},2359:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.1 4.4L8.6 2H7.4L6.9 4.4L6.2 4.7L4.2 3.4L3.3 4.2L4.6 6.2L4.4 6.9L2 7.4V8.6L4.4 9.1L4.7 9.9L3.4 11.9L4.2 12.7L6.2 11.4L7 11.7L7.4 14H8.6L9.1 11.6L9.9 11.3L11.9 12.6L12.7 11.8L11.4 9.8L11.7 9L14 8.6V7.4L11.6 6.9L11.3 6.1L12.6 4.1L11.8 3.3L9.8 4.6L9.1 4.4ZM9.4 1L9.9 3.4L12 2.1L14 4.1L12.6 6.2L15 6.6V9.4L12.6 9.9L14 12L12 14L9.9 12.6L9.4 15H6.6L6.1 12.6L4 13.9L2 11.9L3.4 9.8L1 9.4V6.6L3.4 6.1L2.1 4L4.1 2L6.2 3.4L6.6 1H9.4ZM10 8C10 9.1 9.1 10 8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6C9.1 6 10 6.9 10 8ZM8 9C8.6 9 9 8.6 9 8C9 7.4 8.6 7 8 7C7.4 7 7 7.4 7 8C7 8.6 7.4 9 8 9Z" fill="#C5C5C5"></path></svg>'},459:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.00012 13H7.00012L7.00012 7.00001L13.0001 7.00001V6.00001L7.00012 6.00001L7.00012 3H6.00012L6.00012 6.00001L3.00012 6.00001V7.00001H6.00012L6.00012 13Z" fill="#C5C5C5"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M2.50012 2H13.5001L14.0001 2.5V13.5L13.5001 14H2.50012L2.00012 13.5V2.5L2.50012 2ZM3.00012 13H13.0001V3H3.00012V13Z" fill="#C5C5C5"></path></svg>'},27:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.50002 1C6.21445 1 4.95774 1.38123 3.88882 2.09546C2.8199 2.80969 1.98674 3.82485 1.49478 5.01257C1.00281 6.20029 0.874098 7.50719 1.1249 8.76807C1.37571 10.0289 1.99479 11.1872 2.90383 12.0962C3.81287 13.0052 4.97108 13.6243 6.23196 13.8751C7.49283 14.1259 8.79973 13.9972 9.98745 13.5052C11.1752 13.0133 12.1903 12.1801 12.9046 11.1112C13.6188 10.0423 14 8.78558 14 7.5C14 5.77609 13.3152 4.1228 12.0962 2.90381C10.8772 1.68482 9.22393 1 7.50002 1ZM7.50002 13C6.41223 13 5.34883 12.6775 4.44436 12.0731C3.53989 11.4688 2.83501 10.6097 2.41873 9.60474C2.00244 8.59974 1.89352 7.4939 2.10574 6.427C2.31796 5.36011 2.8418 4.38015 3.61099 3.61096C4.38018 2.84177 5.36013 2.31793 6.42703 2.10571C7.49392 1.89349 8.59977 2.00242 9.60476 2.4187C10.6098 2.83498 11.4688 3.53987 12.0731 4.44434C12.6775 5.34881 13 6.4122 13 7.5C13 8.95869 12.4205 10.3576 11.3891 11.389C10.3576 12.4205 8.95871 13 7.50002 13Z"></path><circle cx="7.50002" cy="7.5" r="1"></circle></svg>'},4674:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M6.27 10.87h.71l4.56-4.56-.71-.71-4.2 4.21-1.92-1.92L4 8.6l2.27 2.27z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6z"></path></svg>'},5064:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.2002 2H8.01724L7.66424 2.146L1.00024 8.81V9.517L6.18324 14.7H6.89024L9.10531 12.4853C9.65832 12.7768 10.2677 12.9502 10.8945 12.9923C11.659 13.0437 12.424 12.8981 13.1162 12.5694C13.8085 12.2407 14.4048 11.74 14.8483 11.1151C15.2918 10.4902 15.5676 9.76192 15.6492 9H15.6493C15.6759 8.83446 15.6929 8.66751 15.7003 8.5C15.6989 7.30693 15.2244 6.16311 14.3808 5.31948C14.1712 5.10988 13.9431 4.92307 13.7002 4.76064V2.5L13.2002 2ZM12.7002 4.25881C12.223 4.08965 11.7162 4.00057 11.2003 4C11.0676 4 10.9405 4.05268 10.8467 4.14645C10.7529 4.24021 10.7003 4.36739 10.7003 4.5C10.7003 4.63261 10.7529 4.75979 10.8467 4.85355C10.9405 4.94732 11.0676 5 11.2003 5C11.7241 5 12.2358 5.11743 12.7002 5.33771V7.476L8.77506 11.4005C8.75767 11.4095 8.74079 11.4194 8.72449 11.4304C8.6685 11.468 8.6207 11.5166 8.58397 11.5731C8.57475 11.5874 8.56627 11.602 8.55856 11.617L6.53624 13.639L2.06124 9.163L8.22424 3H12.7002V4.25881ZM13.7002 6.0505C14.3409 6.70435 14.7003 7.58365 14.7003 8.5C14.6955 8.66769 14.6784 8.8348 14.6493 9H14.6492C14.5675 9.58097 14.3406 10.1319 13.9894 10.6019C13.6383 11.0719 13.1743 11.4457 12.6403 11.6888C12.1063 11.9319 11.5197 12.0363 10.9346 11.9925C10.5622 11.9646 10.1982 11.8772 9.85588 11.7348L13.5542 8.037L13.7002 7.683V6.0505Z" fill="#C5C5C5"></path></svg>'},5570:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.917 7A6.002 6.002 0 0 0 2.083 7H1.071a7.002 7.002 0 0 1 13.858 0h-1.012z"></path></svg>'},346:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.99008 1C4.5965 1 4.21175 1.11671 3.8845 1.33538C3.55724 1.55404 3.30218 1.86484 3.15156 2.22846C3.00094 2.59208 2.96153 2.99221 3.03832 3.37823C3.1151 3.76425 3.30463 4.11884 3.58294 4.39714C3.83589 4.65009 4.15185 4.8297 4.49715 4.91798L4.49099 10.8286C4.40192 10.8517 4.31421 10.881 4.22852 10.9165C3.8649 11.0671 3.5541 11.3222 3.33544 11.6494C3.11677 11.9767 3.00006 12.3614 3.00006 12.755C3.00006 13.2828 3.20972 13.7889 3.58292 14.1621C3.95612 14.5353 4.46228 14.745 4.99006 14.745C5.38365 14.745 5.76839 14.6283 6.09565 14.4096C6.4229 14.191 6.67796 13.8802 6.82858 13.5165C6.9792 13.1529 7.01861 12.7528 6.94182 12.3668C6.86504 11.9807 6.67551 11.6262 6.3972 11.3479C6.14426 11.0949 5.8283 10.9153 5.48299 10.827V9.745H5.48915V8.80133C6.50043 10.3332 8.19531 11.374 10.1393 11.4893C10.2388 11.7413 10.3893 11.9714 10.5825 12.1648C10.8608 12.4432 11.2154 12.6328 11.6014 12.7097C11.9875 12.7866 12.3877 12.7472 12.7513 12.5966C13.115 12.446 13.4259 12.191 13.6446 11.8637C13.8633 11.5364 13.98 11.1516 13.98 10.758C13.98 10.2304 13.7705 9.72439 13.3975 9.35122C13.0245 8.97805 12.5186 8.76827 11.991 8.76801C11.5974 8.76781 11.2126 8.88435 10.8852 9.10289C10.5578 9.32144 10.3026 9.63216 10.1518 9.99577C10.0875 10.1509 10.0434 10.3127 10.0199 10.4772C7.48375 10.2356 5.48915 8.09947 5.48915 5.5C5.48915 5.33125 5.47282 5.16445 5.48915 5V4.9164C5.57823 4.89333 5.66594 4.86401 5.75162 4.82852C6.11525 4.6779 6.42604 4.42284 6.64471 4.09558C6.86337 3.76833 6.98008 3.38358 6.98008 2.99C6.98008 2.46222 6.77042 1.95605 6.39722 1.58286C6.02403 1.20966 5.51786 1 4.99008 1ZM4.99008 2C5.18593 1.9998 5.37743 2.0577 5.54037 2.16636C5.70331 2.27502 5.83035 2.42957 5.90544 2.61045C5.98052 2.79133 6.00027 2.99042 5.96218 3.18253C5.9241 3.37463 5.82989 3.55113 5.69147 3.68968C5.55306 3.82824 5.37666 3.92262 5.18459 3.9609C4.99252 3.99918 4.79341 3.97964 4.61246 3.90474C4.4315 3.82983 4.27682 3.70294 4.168 3.54012C4.05917 3.37729 4.00108 3.18585 4.00108 2.99C4.00135 2.72769 4.1056 2.47618 4.29098 2.29061C4.47637 2.10503 4.72777 2.00053 4.99008 2ZM4.99006 13.745C4.79422 13.7452 4.60271 13.6873 4.43977 13.5786C4.27684 13.47 4.14979 13.3154 4.07471 13.1345C3.99962 12.9537 3.97988 12.7546 4.01796 12.5625C4.05605 12.3704 4.15026 12.1939 4.28867 12.0553C4.42709 11.9168 4.60349 11.8224 4.79555 11.7841C4.98762 11.7458 5.18673 11.7654 5.36769 11.8403C5.54864 11.9152 5.70332 12.0421 5.81215 12.2049C5.92097 12.3677 5.97906 12.5591 5.97906 12.755C5.9788 13.0173 5.87455 13.2688 5.68916 13.4544C5.50377 13.64 5.25237 13.7445 4.99006 13.745ZM11.991 9.76801C12.1868 9.76801 12.3782 9.82607 12.541 9.93485C12.7038 10.0436 12.8307 10.1983 12.9057 10.3791C12.9806 10.56 13.0002 10.7591 12.962 10.9511C12.9238 11.1432 12.8295 11.3196 12.6911 11.458C12.5526 11.5965 12.3762 11.6908 12.1842 11.729C11.9921 11.7672 11.7931 11.7476 11.6122 11.6726C11.4313 11.5977 11.2767 11.4708 11.1679 11.308C11.0591 11.1452 11.001 10.9538 11.001 10.758C11.0013 10.4955 11.1057 10.2439 11.2913 10.0583C11.4769 9.87266 11.7285 9.76827 11.991 9.76801Z" fill="#C5C5C5"></path></svg>'},4370:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5002 4.64639L8.35388 2.5H7.64677L5.50034 4.64639L6.20744 5.35349L7.3003 4.26066V5.27972H7.28082V5.73617L7.30568 5.73717C7.30768 5.84794 7.30968 5.95412 7.31169 6.05572C7.31538 6.24322 7.33201 6.43462 7.36158 6.62994C7.39114 6.82525 7.42994 7.02056 7.47799 7.21587C7.52603 7.41119 7.59255 7.62017 7.67755 7.84283C7.83276 8.22173 8.02124 8.56548 8.24297 8.87408C8.4647 9.18267 8.70307 9.47173 8.95806 9.74127C9.21306 10.0108 9.46621 10.2764 9.71751 10.5381C9.9688 10.7999 10.1961 11.0792 10.3993 11.376C10.6026 11.6729 10.767 11.9971 10.8927 12.3487C11.0183 12.7002 11.0812 13.1045 11.0812 13.5616V14.4463H12.5003V13.5616C12.4929 13.042 12.4375 12.5792 12.334 12.1729C12.2305 11.7667 12.0882 11.3995 11.9071 11.0713C11.7261 10.7432 11.5246 10.4444 11.3029 10.1749C11.0812 9.90533 10.8502 9.64752 10.61 9.40142C10.3698 9.15533 10.1388 8.90923 9.91707 8.66314C9.69533 8.41705 9.49392 8.15533 9.31284 7.87798C9.13176 7.60064 8.98763 7.29595 8.88046 6.96392C8.77329 6.63189 8.7197 6.25494 8.7197 5.83306V5.27972H8.71901V4.27935L9.79314 5.3535L10.5002 4.64639ZM7.04245 9.74127C7.15517 9.62213 7.26463 9.49917 7.37085 9.3724C7.12665 9.01878 6.92109 8.63423 6.75218 8.22189L6.74317 8.19952C6.70951 8.11134 6.67794 8.02386 6.6486 7.93713C6.47774 8.19261 6.28936 8.43461 6.08345 8.66314C5.86172 8.90923 5.63074 9.15533 5.39053 9.40142C5.15032 9.64752 4.91935 9.90533 4.69761 10.1749C4.47588 10.4444 4.27447 10.7432 4.09338 11.0713C3.9123 11.3995 3.77002 11.7667 3.66654 12.1729C3.56307 12.5792 3.50764 13.042 3.50024 13.5616V14.4463H4.91935V13.5616C4.91935 13.1045 4.98217 12.7002 5.10782 12.3487C5.23347 11.9971 5.39792 11.6729 5.60118 11.376C5.80444 11.0792 6.03171 10.7999 6.28301 10.5381C6.53431 10.2764 6.78746 10.0108 7.04245 9.74127Z" fill="#424242"></path></svg>'},628:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.99976 1H6.99976V3H1.49976L0.999756 3.5V7.5L1.49976 8H6.99976V15H7.99976V8H12.4898L12.8298 7.87L15.0098 5.87V5.13L12.8298 3.13L12.4998 3H7.99976V1ZM12.2898 7H1.99976V4H12.2898L13.9198 5.5L12.2898 7ZM4.99976 5H9.99976V6H4.99976V5Z" fill="#C5C5C5"></path></svg>'},5010:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 7V8H8V14H7V8H1V7H7V1H8V7H14Z" fill="#C5C5C5"></path></svg>'},4268:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.616 4.928a2.487 2.487 0 0 1-1.119.922c-.148.06-.458.138-.458.138v5.008a2.51 2.51 0 0 1 1.579 1.062c.273.412.419.895.419 1.388.008.343-.057.684-.19 1A2.485 2.485 0 0 1 3.5 15.984a2.482 2.482 0 0 1-1.388-.419A2.487 2.487 0 0 1 1.05 13c.095-.486.331-.932.68-1.283.349-.343.79-.579 1.269-.68V5.949a2.6 2.6 0 0 1-1.269-.68 2.503 2.503 0 0 1-.68-1.283 2.487 2.487 0 0 1 1.06-2.565A2.49 2.49 0 0 1 3.5 1a2.504 2.504 0 0 1 1.807.729 2.493 2.493 0 0 1 .729 1.81c.002.494-.144.978-.42 1.389zm-.756 7.861a1.5 1.5 0 0 0-.552-.579 1.45 1.45 0 0 0-.77-.21 1.495 1.495 0 0 0-1.47 1.79 1.493 1.493 0 0 0 1.18 1.179c.288.058.586.03.86-.08.276-.117.512-.312.68-.56.15-.226.235-.49.249-.76a1.51 1.51 0 0 0-.177-.78zM2.708 4.741c.247.161.536.25.83.25.271 0 .538-.075.77-.211a1.514 1.514 0 0 0 .729-1.359 1.513 1.513 0 0 0-.25-.76 1.551 1.551 0 0 0-.68-.56 1.49 1.49 0 0 0-.86-.08 1.494 1.494 0 0 0-1.179 1.18c-.058.288-.03.586.08.86.117.276.312.512.56.68zm10.329 6.296c.48.097.922.335 1.269.68.466.47.729 1.107.725 1.766.002.493-.144.977-.42 1.388a2.499 2.499 0 0 1-4.532-.899 2.5 2.5 0 0 1 1.067-2.565c.267-.183.571-.308.889-.37V5.489a1.5 1.5 0 0 0-1.5-1.499H8.687l1.269 1.27-.71.709L7.117 3.84v-.7l2.13-2.13.71.711-1.269 1.27h1.85a2.484 2.484 0 0 1 2.312 1.541c.125.302.189.628.187.957v5.548zm.557 3.509a1.493 1.493 0 0 0 .191-1.89 1.552 1.552 0 0 0-.68-.559 1.49 1.49 0 0 0-.86-.08 1.493 1.493 0 0 0-1.179 1.18 1.49 1.49 0 0 0 .08.86 1.496 1.496 0 0 0 2.448.49z"></path></svg>'},340:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.38893 12.9906L6.11891 11.7205L6.78893 11.0206L8.91893 13.1506V13.8505L6.78893 15.9805L6.07893 15.2706L7.34892 14.0006H5.49892C5.17024 14.0019 4.84458 13.9381 4.54067 13.8129C4.23675 13.6878 3.96061 13.5037 3.7282 13.2713C3.49579 13.0389 3.31171 12.7627 3.18654 12.4588C3.06137 12.1549 2.99759 11.8292 2.99892 11.5006V5.95052C2.5198 5.84851 2.07944 5.61279 1.72893 5.27059C1.3808 4.91884 1.14393 4.47238 1.0479 3.98689C0.951867 3.50141 1.00092 2.9984 1.18892 2.54061C1.37867 2.08436 1.69938 1.69458 2.11052 1.42049C2.52166 1.14639 3.00479 1.00024 3.49892 1.00057C3.84188 0.993194 4.18256 1.05787 4.49892 1.19051C4.80197 1.31518 5.07732 1.49871 5.30904 1.73042C5.54075 1.96214 5.72425 2.23755 5.84892 2.54061C5.98157 2.85696 6.0463 3.19765 6.03893 3.54061C6.03926 4.03474 5.89316 4.51789 5.61906 4.92903C5.34497 5.34017 4.95516 5.6608 4.49892 5.85054C4.35057 5.91224 4.19649 5.95915 4.03893 5.99056V11.4906C4.03893 11.8884 4.19695 12.2699 4.47826 12.5512C4.75956 12.8325 5.1411 12.9906 5.53893 12.9906H7.38893ZM2.70894 4.74056C2.95497 4.90376 3.24368 4.99072 3.53893 4.99056C3.81026 4.99066 4.07654 4.91718 4.3094 4.77791C4.54227 4.63864 4.73301 4.43877 4.86128 4.19966C4.98956 3.96056 5.05057 3.69116 5.03783 3.42012C5.02508 3.14908 4.93907 2.88661 4.78893 2.6606C4.62119 2.4121 4.38499 2.21751 4.10893 2.10054C3.83645 1.98955 3.53719 1.96176 3.24892 2.02059C2.95693 2.07705 2.68852 2.2196 2.47823 2.42989C2.26793 2.64018 2.12539 2.90853 2.06892 3.20052C2.0101 3.4888 2.03792 3.78802 2.14891 4.0605C2.26588 4.33656 2.46043 4.57282 2.70894 4.74056ZM13.0389 11.0406C13.5196 11.1384 13.9612 11.3747 14.309 11.7206C14.7766 12.191 15.039 12.8273 15.0389 13.4906C15.0393 13.9847 14.8932 14.4679 14.6191 14.879C14.345 15.2902 13.9552 15.6109 13.499 15.8007C13.0416 15.9915 12.5378 16.0421 12.0516 15.946C11.5654 15.85 11.1187 15.6117 10.7683 15.2612C10.4179 14.9108 10.1795 14.4641 10.0835 13.9779C9.98746 13.4917 10.0381 12.988 10.2289 12.5306C10.4218 12.0768 10.7412 11.688 11.1489 11.4106C11.4177 11.2286 11.7204 11.1028 12.0389 11.0406V5.4906C12.0389 5.09278 11.8809 4.71124 11.5996 4.42993C11.3183 4.14863 10.9368 3.9906 10.5389 3.9906H8.68896L9.95892 5.26062L9.24896 5.97058L7.11893 3.84058V3.14063L9.24896 1.01062L9.95892 1.72058L8.68896 2.9906H10.5389C10.8676 2.98928 11.1933 3.05305 11.4972 3.17822C11.8011 3.30339 12.0772 3.48744 12.3096 3.71985C12.542 3.95226 12.7262 4.22844 12.8513 4.53235C12.9765 4.83626 13.0403 5.16193 13.0389 5.4906V11.0406ZM12.6879 14.9829C13.0324 14.9483 13.3542 14.7956 13.5989 14.5507C13.8439 14.306 13.9966 13.984 14.0313 13.6395C14.0659 13.295 13.9803 12.9492 13.7889 12.6606C13.6212 12.4121 13.385 12.2176 13.1089 12.1006C12.8365 11.9896 12.5372 11.9618 12.249 12.0206C11.957 12.0771 11.6886 12.2196 11.4783 12.4299C11.268 12.6402 11.1254 12.9086 11.069 13.2006C11.0101 13.4888 11.0379 13.7881 11.1489 14.0605C11.2659 14.3366 11.4604 14.5729 11.7089 14.7406C11.9975 14.9319 12.3434 15.0175 12.6879 14.9829Z" fill="#C5C5C5"></path></svg>'},659:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.61594 4.92769C5.34304 5.33899 4.95319 5.66062 4.49705 5.8497C4.34891 5.91013 4.03897 5.9881 4.03897 5.9881V10.9958C4.19686 11.027 4.35086 11.0738 4.499 11.1362C4.95513 11.3272 5.34304 11.6469 5.61789 12.0582C5.89079 12.4695 6.03699 12.9529 6.03699 13.4461C6.04478 13.7891 5.98046 14.1303 5.84791 14.446C5.72315 14.7482 5.53992 15.023 5.30796 15.255C5.07794 15.487 4.80114 15.6702 4.499 15.7949C4.18322 15.9275 3.84209 15.9918 3.49902 15.984C3.00585 15.986 2.52243 15.8398 2.11113 15.5649C1.69983 15.292 1.3782 14.9022 1.18912 14.446C1.00198 13.988 0.953253 13.485 1.04877 12.9997C1.14428 12.5143 1.38015 12.0679 1.72907 11.717C2.07799 11.374 2.51853 11.1381 2.99805 11.0367V5.94911C2.52048 5.8458 2.07994 5.61189 1.72907 5.26881C1.38015 4.91794 1.14428 4.47155 1.04877 3.98618C0.951304 3.50081 1.00004 2.99789 1.18912 2.53981C1.3782 2.08368 1.69983 1.69382 2.11113 1.42092C2.52048 1.14607 3.0039 0.999877 3.49902 0.999877C3.84014 0.99403 4.18127 1.05836 4.49705 1.18896C4.79919 1.31371 5.07404 1.49695 5.30601 1.72891C5.53797 1.96087 5.7212 2.23767 5.84596 2.53981C5.97851 2.8556 6.04284 3.19672 6.03504 3.5398C6.03699 4.03296 5.89079 4.51639 5.61594 4.92769ZM4.85962 12.7892C4.73097 12.5494 4.53994 12.3486 4.30797 12.2102C4.07601 12.0699 3.80896 11.9958 3.538 11.9997C3.24171 11.9997 2.95322 12.0855 2.70761 12.2492C2.46005 12.4168 2.26512 12.6527 2.14816 12.9295C2.03706 13.2024 2.00977 13.5006 2.06824 13.7891C2.12477 14.0796 2.26707 14.3486 2.47759 14.5591C2.68812 14.7696 2.95517 14.9119 3.24756 14.9685C3.53606 15.0269 3.8343 14.9996 4.1072 14.8885C4.38399 14.7716 4.61986 14.5766 4.7875 14.3291C4.93759 14.103 5.02336 13.8398 5.037 13.5689C5.0487 13.2979 4.98827 13.0289 4.85962 12.7892ZM2.70761 4.74056C2.95517 4.90235 3.24366 4.99006 3.538 4.99006C3.80896 4.99006 4.07601 4.91599 4.30797 4.77954C4.53994 4.63919 4.73097 4.44037 4.85962 4.2006C4.98827 3.96084 5.05065 3.69184 5.037 3.42089C5.02336 3.14994 4.93759 2.88679 4.7875 2.66067C4.61986 2.41311 4.38399 2.21818 4.1072 2.10122C3.8343 1.99011 3.53606 1.96282 3.24756 2.0213C2.95712 2.07783 2.68812 2.22013 2.47759 2.43065C2.26707 2.64118 2.12477 2.90823 2.06824 3.20062C2.00977 3.48911 2.03706 3.78735 2.14816 4.06025C2.26512 4.33705 2.46005 4.57292 2.70761 4.74056ZM13.0368 11.0368C13.5164 11.1342 13.9588 11.372 14.3058 11.7171C14.7717 12.1868 15.0348 12.8243 15.0309 13.4831C15.0329 13.9763 14.8867 14.4597 14.6119 14.871C14.339 15.2823 13.9491 15.6039 13.493 15.793C13.0368 15.984 12.532 16.0347 12.0466 15.9392C11.5612 15.8437 11.1148 15.6059 10.764 15.255C10.415 14.9041 10.1753 14.4578 10.0798 13.9724C9.98425 13.487 10.0349 12.9841 10.226 12.526C10.4189 12.0738 10.7386 11.6839 11.146 11.4071C11.4131 11.2239 11.7172 11.0991 12.0349 11.0368V7.4891H13.0368V11.0368ZM13.5943 14.5455C13.8399 14.3018 13.992 13.9802 14.0271 13.6352C14.0622 13.2921 13.9764 12.9451 13.7854 12.6566C13.6177 12.4091 13.3819 12.2141 13.1051 12.0972C12.8322 11.9861 12.5339 11.9588 12.2454 12.0173C11.955 12.0738 11.686 12.2161 11.4755 12.4266C11.2649 12.6371 11.1226 12.9042 11.0661 13.1966C11.0076 13.4851 11.0349 13.7833 11.146 14.0562C11.263 14.333 11.4579 14.5689 11.7055 14.7365C11.994 14.9275 12.339 15.0133 12.684 14.9782C13.0271 14.9431 13.3507 14.7911 13.5943 14.5455Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.6876 3.40036L10 5.088L10.7071 5.7951L12.3947 4.10747L14.0824 5.7951L14.7895 5.088L13.1019 3.40036L14.7895 1.71272L14.0824 1.00562L12.3947 2.69325L10.7071 1.00562L10 1.71272L11.6876 3.40036Z"></path></svg>'},3344:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M4.49705 5.8497C4.95319 5.66062 5.34304 5.33899 5.61594 4.92769C5.89079 4.51639 6.03699 4.03296 6.03504 3.5398C6.04284 3.19672 5.97851 2.8556 5.84596 2.53981C5.7212 2.23767 5.53797 1.96087 5.30601 1.72891C5.07404 1.49695 4.79919 1.31371 4.49705 1.18896C4.18127 1.05836 3.84014 0.99403 3.49902 0.999877C3.0039 0.999877 2.52048 1.14607 2.11113 1.42092C1.69983 1.69382 1.3782 2.08368 1.18912 2.53981C1.00004 2.99789 0.951304 3.50081 1.04877 3.98618C1.14428 4.47155 1.38015 4.91794 1.72907 5.26881C2.07994 5.61189 2.52048 5.8458 2.99805 5.94911V11.0367C2.51853 11.1381 2.07799 11.374 1.72907 11.717C1.38015 12.0679 1.14428 12.5143 1.04877 12.9997C0.953253 13.485 1.00198 13.988 1.18912 14.446C1.3782 14.9022 1.69983 15.292 2.11113 15.5649C2.52243 15.8398 3.00585 15.986 3.49902 15.984C3.84209 15.9918 4.18322 15.9275 4.499 15.7949C4.80114 15.6702 5.07794 15.487 5.30796 15.255C5.53992 15.023 5.72315 14.7482 5.84791 14.446C5.98046 14.1303 6.04478 13.7891 6.03699 13.4461C6.03699 12.9529 5.89079 12.4695 5.61789 12.0582C5.34304 11.6469 4.95513 11.3272 4.499 11.1362C4.35086 11.0738 4.19686 11.027 4.03897 10.9958V5.9881C4.03897 5.9881 4.34891 5.91013 4.49705 5.8497ZM4.30797 12.2102C4.53994 12.3486 4.73097 12.5494 4.85962 12.7892C4.98827 13.0289 5.0487 13.2979 5.037 13.5689C5.02336 13.8398 4.93759 14.103 4.7875 14.3291C4.61986 14.5766 4.38399 14.7716 4.1072 14.8885C3.8343 14.9996 3.53606 15.0269 3.24756 14.9685C2.95517 14.9119 2.68812 14.7696 2.47759 14.5591C2.26707 14.3486 2.12477 14.0796 2.06824 13.7891C2.00977 13.5006 2.03706 13.2024 2.14816 12.9295C2.26512 12.6527 2.46005 12.4168 2.70761 12.2492C2.95322 12.0855 3.24171 11.9997 3.538 11.9997C3.80896 11.9958 4.07601 12.0699 4.30797 12.2102ZM3.538 4.99006C3.24366 4.99006 2.95517 4.90235 2.70761 4.74056C2.46005 4.57292 2.26512 4.33705 2.14816 4.06025C2.03706 3.78735 2.00977 3.48911 2.06824 3.20062C2.12477 2.90823 2.26707 2.64118 2.47759 2.43065C2.68812 2.22013 2.95712 2.07783 3.24756 2.0213C3.53606 1.96282 3.8343 1.99011 4.1072 2.10122C4.38399 2.21818 4.61986 2.41311 4.7875 2.66067C4.93759 2.88679 5.02336 3.14994 5.037 3.42089C5.05065 3.69184 4.98827 3.96084 4.85962 4.2006C4.73097 4.44037 4.53994 4.63919 4.30797 4.77954C4.07601 4.91599 3.80896 4.99006 3.538 4.99006Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M15.0543 13.5C15.0543 14.8807 13.935 16 12.5543 16C11.1736 16 10.0543 14.8807 10.0543 13.5C10.0543 12.1193 11.1736 11 12.5543 11C13.935 11 15.0543 12.1193 15.0543 13.5ZM12.5543 15C13.3827 15 14.0543 14.3284 14.0543 13.5C14.0543 12.6716 13.3827 12 12.5543 12C11.7258 12 11.0543 12.6716 11.0543 13.5C11.0543 14.3284 11.7258 15 12.5543 15Z"></path><circle cx="12.5543" cy="7.75073" r="1"></circle><circle cx="12.5543" cy="3.50146" r="1"></circle></svg>'},9649:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.14648 6.3065L6.16649 2.2865L6.87359 2.2865L10.8936 6.3065L10.1865 7.0136L6.97998 3.8071L6.97998 5.69005C6.97998 8.50321 7.58488 10.295 8.70856 11.3953C9.83407 12.4974 11.5857 13.0101 14.13 13.0101L14.48 13.0101L14.48 14.0101L14.13 14.0101C11.4843 14.0101 9.4109 13.4827 8.00891 12.1098C6.60509 10.7351 5.97998 8.61689 5.97998 5.69005L5.97998 3.88722L2.85359 7.01361L2.14648 6.3065Z" fill="#C5C5C5"></path></svg>'},2362:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.16 3.5C4.73 5.06 3.55 6.67 3.55 9.36c.16-.05.3-.05.44-.05 1.27 0 2.5.86 2.5 2.41 0 1.61-1.03 2.61-2.5 2.61-1.9 0-2.99-1.52-2.99-4.25 0-3.8 1.75-6.53 5.02-8.42L7.16 3.5zm7 0c-2.43 1.56-3.61 3.17-3.61 5.86.16-.05.3-.05.44-.05 1.27 0 2.5.86 2.5 2.41 0 1.61-1.03 2.61-2.5 2.61-1.89 0-2.98-1.52-2.98-4.25 0-3.8 1.75-6.53 5.02-8.42l1.14 1.84h-.01z"></path></svg>'},8923:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.7099 1.29L13.7099 4.29L13.9999 5V14L12.9999 15H3.99994L2.99994 14V2L3.99994 1H9.99994L10.7099 1.29ZM3.99994 14H12.9999V5L9.99994 2H3.99994V14ZM8 6H6V7H8V9H9V7H11V6H9V4H8V6ZM6 11H11V12H6V11Z"></path></svg>'},6855:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.54883 10.0781C8.00911 10.2604 8.42839 10.502 8.80664 10.8027C9.1849 11.1035 9.50846 11.4521 9.77734 11.8486C10.0462 12.2451 10.2536 12.6712 10.3994 13.127C10.5452 13.5827 10.6204 14.0612 10.625 14.5625V15H9.75V14.5625C9.75 14.0202 9.64746 13.5098 9.44238 13.0312C9.2373 12.5527 8.95475 12.1357 8.59473 11.7803C8.2347 11.4248 7.81771 11.1445 7.34375 10.9395C6.86979 10.7344 6.35938 10.6296 5.8125 10.625C5.27018 10.625 4.75977 10.7275 4.28125 10.9326C3.80273 11.1377 3.38574 11.4202 3.03027 11.7803C2.6748 12.1403 2.39453 12.5573 2.18945 13.0312C1.98438 13.5052 1.87956 14.0156 1.875 14.5625V15H1V14.5625C1 14.0658 1.07292 13.5872 1.21875 13.127C1.36458 12.6667 1.57422 12.2406 1.84766 11.8486C2.12109 11.4567 2.44466 11.1104 2.81836 10.8096C3.19206 10.5088 3.61133 10.265 4.07617 10.0781C3.87109 9.93685 3.68652 9.77279 3.52246 9.58594C3.3584 9.39909 3.2194 9.19857 3.10547 8.98438C2.99154 8.77018 2.90495 8.54232 2.8457 8.30078C2.78646 8.05924 2.75456 7.81315 2.75 7.5625C2.75 7.13867 2.82975 6.74219 2.98926 6.37305C3.14876 6.00391 3.36751 5.68034 3.64551 5.40234C3.9235 5.12435 4.24707 4.9056 4.61621 4.74609C4.98535 4.58659 5.38411 4.50456 5.8125 4.5C6.23633 4.5 6.63281 4.57975 7.00195 4.73926C7.37109 4.89876 7.69466 5.11751 7.97266 5.39551C8.25065 5.6735 8.4694 5.99707 8.62891 6.36621C8.78841 6.73535 8.87044 7.13411 8.875 7.5625C8.875 7.81315 8.84538 8.05697 8.78613 8.29395C8.72689 8.53092 8.63802 8.75879 8.51953 8.97754C8.40104 9.19629 8.26204 9.39909 8.10254 9.58594C7.94303 9.77279 7.75846 9.93685 7.54883 10.0781ZM5.8125 9.75C6.11328 9.75 6.39583 9.69303 6.66016 9.5791C6.92448 9.46517 7.15462 9.31022 7.35059 9.11426C7.54655 8.91829 7.70378 8.68587 7.82227 8.41699C7.94076 8.14811 8 7.86328 8 7.5625C8 7.26172 7.94303 6.97917 7.8291 6.71484C7.71517 6.45052 7.55794 6.22038 7.35742 6.02441C7.1569 5.82845 6.92448 5.67122 6.66016 5.55273C6.39583 5.43424 6.11328 5.375 5.8125 5.375C5.51172 5.375 5.22917 5.43197 4.96484 5.5459C4.70052 5.65983 4.4681 5.81706 4.26758 6.01758C4.06706 6.2181 3.90983 6.45052 3.7959 6.71484C3.68197 6.97917 3.625 7.26172 3.625 7.5625C3.625 7.86328 3.68197 8.14583 3.7959 8.41016C3.90983 8.67448 4.06478 8.9069 4.26074 9.10742C4.45671 9.30794 4.68913 9.46517 4.95801 9.5791C5.22689 9.69303 5.51172 9.75 5.8125 9.75ZM15 1V8H13.25L10.625 10.625V8H9.75V7.125H11.5V8.5127L12.8877 7.125H14.125V1.875H5.375V3.44727C5.22917 3.46549 5.08333 3.48828 4.9375 3.51562C4.79167 3.54297 4.64583 3.58398 4.5 3.63867V1H15Z" fill="#C5C5C5"></path></svg>'},5493:k=>{k.exports='<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.12 4.37333L8.58667 1.97333H7.41333L6.88 4.37333L6.18667 4.69333L4.21333 3.41333L3.30667 4.21333L4.58667 6.18667L4.42667 6.88L2.02667 7.41333V8.58667L4.42667 9.12L4.69333 9.92L3.41333 11.8933L4.21333 12.6933L6.18667 11.4133L6.98667 11.68L7.41333 13.9733H8.58667L9.12 11.5733L9.92 11.3067L11.8933 12.5867L12.6933 11.7867L11.4133 9.81333L11.68 9.01333L14.0267 8.58667V7.41333L11.6267 6.88L11.3067 6.08L12.5867 4.10667L11.7867 3.30667L9.81333 4.58667L9.12 4.37333ZM9.38667 1.01333L9.92 3.41333L12 2.08L14.0267 4.10667L12.5867 6.18667L14.9867 6.61333V9.38667L12.5867 9.92L14.0267 12L12 13.9733L9.92 12.5867L9.38667 14.9867H6.61333L6.08 12.5867L4 13.92L2.02667 11.8933L3.41333 9.81333L1.01333 9.38667V6.61333L3.41333 6.08L2.08 4L4.10667 1.97333L6.18667 3.41333L6.61333 1.01333H9.38667ZM10.0267 8C10.0267 8.53333 9.81333 8.99556 9.38667 9.38667C8.99556 9.77778 8.53333 9.97333 8 9.97333C7.46667 9.97333 7.00444 9.77778 6.61333 9.38667C6.22222 8.99556 6.02667 8.53333 6.02667 8C6.02667 7.46667 6.22222 7.00444 6.61333 6.61333C7.00444 6.18667 7.46667 5.97333 8 5.97333C8.53333 5.97333 8.99556 6.18667 9.38667 6.61333C9.81333 7.00444 10.0267 7.46667 10.0267 8ZM8 9.01333C8.28444 9.01333 8.51556 8.92444 8.69333 8.74667C8.90667 8.53333 9.01333 8.28444 9.01333 8C9.01333 7.71556 8.90667 7.48444 8.69333 7.30667C8.51556 7.09333 8.28444 6.98667 8 6.98667C7.71556 6.98667 7.46667 7.09333 7.25333 7.30667C7.07556 7.48444 6.98667 7.71556 6.98667 8C6.98667 8.28444 7.07556 8.53333 7.25333 8.74667C7.46667 8.92444 7.71556 9.01333 8 9.01333Z" fill="#CCCCCC"></path></svg>'},1779:k=>{k.exports='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.28 7.78a.75.75 0 00-1.06-1.06l-9.5 9.5a.75.75 0 101.06 1.06l9.5-9.5z"></path><path fill-rule="evenodd" d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM2.5 12a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z"></path></svg>'},596:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M5.39804 10.8069C5.57428 10.9312 5.78476 10.9977 6.00043 10.9973C6.21633 10.9975 6.42686 10.93 6.60243 10.8043C6.77993 10.6739 6.91464 10.4936 6.98943 10.2863L7.43643 8.91335C7.55086 8.56906 7.74391 8.25615 8.00028 7.99943C8.25665 7.74272 8.56929 7.54924 8.91343 7.43435L10.3044 6.98335C10.4564 6.92899 10.5936 6.84019 10.7055 6.7239C10.8174 6.60762 10.9008 6.467 10.9492 6.31308C10.9977 6.15916 11.0098 5.99611 10.9847 5.83672C10.9596 5.67732 10.8979 5.52591 10.8044 5.39435C10.6703 5.20842 10.4794 5.07118 10.2604 5.00335L8.88543 4.55635C8.54091 4.44212 8.22777 4.24915 7.97087 3.99277C7.71396 3.73638 7.52035 3.42363 7.40543 3.07935L6.95343 1.69135C6.88113 1.48904 6.74761 1.31428 6.57143 1.19135C6.43877 1.09762 6.28607 1.03614 6.12548 1.01179C5.96489 0.987448 5.80083 1.00091 5.64636 1.05111C5.49188 1.1013 5.35125 1.18685 5.23564 1.30095C5.12004 1.41505 5.03265 1.55454 4.98043 1.70835L4.52343 3.10835C4.40884 3.44317 4.21967 3.74758 3.97022 3.9986C3.72076 4.24962 3.41753 4.44067 3.08343 4.55735L1.69243 5.00535C1.54065 5.05974 1.40352 5.14852 1.29177 5.26474C1.18001 5.38095 1.09666 5.52145 1.04824 5.67523C0.999819 5.82902 0.987639 5.99192 1.01265 6.1512C1.03767 6.31048 1.0992 6.46181 1.19243 6.59335C1.32027 6.7728 1.50105 6.90777 1.70943 6.97935L3.08343 7.42435C3.52354 7.57083 3.90999 7.84518 4.19343 8.21235C4.35585 8.42298 4.4813 8.65968 4.56443 8.91235L5.01643 10.3033C5.08846 10.5066 5.22179 10.6826 5.39804 10.8069ZM5.48343 3.39235L6.01043 2.01535L6.44943 3.39235C6.61312 3.8855 6.88991 4.33351 7.25767 4.70058C7.62544 5.06765 8.07397 5.34359 8.56743 5.50635L9.97343 6.03535L8.59143 6.48335C8.09866 6.64764 7.65095 6.92451 7.28382 7.29198C6.9167 7.65945 6.64026 8.10742 6.47643 8.60035L5.95343 9.97835L5.50443 8.59935C5.34335 8.10608 5.06943 7.65718 4.70443 7.28835C4.3356 6.92031 3.88653 6.64272 3.39243 6.47735L2.01443 5.95535L3.40043 5.50535C3.88672 5.33672 4.32775 5.05855 4.68943 4.69235C5.04901 4.32464 5.32049 3.88016 5.48343 3.39235ZM11.5353 14.8494C11.6713 14.9456 11.8337 14.9973 12.0003 14.9974C12.1654 14.9974 12.3264 14.9464 12.4613 14.8514C12.6008 14.7529 12.7058 14.6129 12.7613 14.4514L13.0093 13.6894C13.0625 13.5309 13.1515 13.3869 13.2693 13.2684C13.3867 13.1498 13.5307 13.0611 13.6893 13.0094L14.4613 12.7574C14.619 12.7029 14.7557 12.6004 14.8523 12.4644C14.9257 12.3614 14.9736 12.2424 14.9921 12.1173C15.0106 11.9922 14.9992 11.8645 14.9588 11.7447C14.9184 11.6249 14.8501 11.5163 14.7597 11.428C14.6692 11.3396 14.5591 11.2739 14.4383 11.2364L13.6743 10.9874C13.5162 10.9348 13.3724 10.8462 13.2544 10.7285C13.1364 10.6109 13.0473 10.4674 12.9943 10.3094L12.7423 9.53638C12.6886 9.37853 12.586 9.24191 12.4493 9.14638C12.3473 9.07343 12.2295 9.02549 12.1056 9.00642C11.9816 8.98736 11.8549 8.99772 11.7357 9.03665C11.6164 9.07558 11.508 9.142 11.4192 9.23054C11.3304 9.31909 11.2636 9.42727 11.2243 9.54638L10.9773 10.3084C10.925 10.466 10.8375 10.6097 10.7213 10.7284C10.6066 10.8449 10.4667 10.9335 10.3123 10.9874L9.53931 11.2394C9.38025 11.2933 9.2422 11.3959 9.1447 11.5326C9.04721 11.6694 8.99522 11.8333 8.99611 12.0013C8.99699 12.1692 9.0507 12.3326 9.14963 12.4683C9.24856 12.604 9.38769 12.7051 9.54731 12.7574L10.3103 13.0044C10.4692 13.0578 10.6136 13.1471 10.7323 13.2654C10.8505 13.3836 10.939 13.5283 10.9903 13.6874L11.2433 14.4614C11.2981 14.6178 11.4001 14.7534 11.5353 14.8494ZM10.6223 12.0564L10.4433 11.9974L10.6273 11.9334C10.9291 11.8284 11.2027 11.6556 11.4273 11.4284C11.6537 11.1994 11.8248 10.9216 11.9273 10.6164L11.9853 10.4384L12.0443 10.6194C12.1463 10.9261 12.3185 11.2047 12.5471 11.4332C12.7757 11.6617 13.0545 11.8336 13.3613 11.9354L13.5563 11.9984L13.3763 12.0574C13.0689 12.1596 12.7898 12.3322 12.5611 12.5616C12.3324 12.791 12.1606 13.0707 12.0593 13.3784L12.0003 13.5594L11.9423 13.3784C11.8409 13.0702 11.6687 12.7901 11.4394 12.5605C11.2102 12.3309 10.9303 12.1583 10.6223 12.0564Z"></path></svg>'},3027:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M6 6h4v4H6z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8.6 1c1.6.1 3.1.9 4.2 2 1.3 1.4 2 3.1 2 5.1 0 1.6-.6 3.1-1.6 4.4-1 1.2-2.4 2.1-4 2.4-1.6.3-3.2.1-4.6-.7-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1.8-1.1 1.3-2.4 1.2-3.8 0-1.6-.6-3.2-1.7-4.3-1-1-2.2-1.6-3.6-1.7-1.3-.1-2.7.2-3.8 1-1.1.8-1.9 1.9-2.3 3.3-.4 1.3-.4 2.7.2 4 .6 1.3 1.5 2.3 2.7 3 1.2.7 2.6.9 3.9.6z"></path></svg>'},7411:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.006 8.267L.78 9.5 0 8.73l2.09-2.07.76.01 2.09 2.12-.76.76-1.167-1.18a5 5 0 0 0 9.4 1.983l.813.597a6 6 0 0 1-11.22-2.683zm10.99-.466L11.76 6.55l-.76.76 2.09 2.11.76.01 2.09-2.07-.75-.76-1.194 1.18a6 6 0 0 0-11.11-2.92l.81.594a5 5 0 0 1 9.3 2.346z"></path></svg>'},5013:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.57 6.699l5.693-4.936L8.585 1 3.273 5.596l-1.51-1.832L1 4.442l1.85 2.214.72.043zM15 5H6.824l2.307-2H15v2zM6 7h9v2H6V7zm9 4H6v2h9v-2z"></path></svg>'},2481:k=>{k.exports='<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M14 5H2V3h12v2zm0 4H2V7h12v2zM2 13h12v-2H2v2z"></path></svg>'}},oi={};function ee(k){var _=oi[k];if(_!==void 0)return _.exports;var j=oi[k]={id:k,exports:{}};return Fl[k].call(j.exports,j,j.exports,ee),j.exports}i(ee,"__webpack_require__"),ee.n=k=>{var _=k&&k.__esModule?()=>k.default:()=>k;return ee.d(_,{a:_}),_},ee.d=(k,_)=>{for(var j in _)ee.o(_,j)&&!ee.o(k,j)&&Object.defineProperty(k,j,{enumerable:!0,get:_[j]})},ee.o=(k,_)=>Object.prototype.hasOwnProperty.call(k,_),ee.nc=void 0;var lc={};(()=>{"use strict";var pn;var k=ee(5072),_=ee.n(k),j=ee(7825),Y=ee.n(j),$=ee(7659),T=ee.n($),g=ee(5056),h=ee.n(g),A=ee(540),I=ee.n(A),z=ee(1113),V=ee.n(z),J=ee(2410),G={};G.styleTagTransform=V(),G.setAttributes=h(),G.insert=T().bind(null,"head"),G.domAPI=Y(),G.insertStyleElement=I();var De=_()(J.A,G);const Ve=J.A&&J.A.locals?J.A.locals:void 0;var fe=ee(3554),Ae={};Ae.styleTagTransform=V(),Ae.setAttributes=h(),Ae.insert=T().bind(null,"head"),Ae.domAPI=Y(),Ae.insertStyleElement=I();var rt=_()(fe.A,Ae);const U=fe.A&&fe.A.locals?fe.A.locals:void 0;var N=ee(7334),l=ee(6540),ie=ee(961),Z=(o=>(o[o.Committed=0]="Committed",o[o.Mentioned=1]="Mentioned",o[o.Subscribed=2]="Subscribed",o[o.Commented=3]="Commented",o[o.Reviewed=4]="Reviewed",o[o.NewCommitsSinceReview=5]="NewCommitsSinceReview",o[o.Labeled=6]="Labeled",o[o.Milestoned=7]="Milestoned",o[o.Assigned=8]="Assigned",o[o.Unassigned=9]="Unassigned",o[o.HeadRefDeleted=10]="HeadRefDeleted",o[o.Merged=11]="Merged",o[o.CrossReferenced=12]="CrossReferenced",o[o.Closed=13]="Closed",o[o.Reopened=14]="Reopened",o[o.CopilotStarted=15]="CopilotStarted",o[o.CopilotFinished=16]="CopilotFinished",o[o.CopilotFinishedError=17]="CopilotFinishedError",o[o.Other=18]="Other",o))(Z||{}),q=Object.defineProperty,D=i((o,a,u)=>a in o?q(o,a,{enumerable:!0,configurable:!0,writable:!0,value:u}):o[a]=u,"__defNormalProp"),H=i((o,a,u)=>D(o,typeof a!="symbol"?a+"":a,u),"__publicField");const re=acquireVsCodeApi(),qr=class qr{constructor(a){H(this,"_commandHandler"),H(this,"lastSentReq"),H(this,"pendingReplies"),this._commandHandler=a,this.lastSentReq=0,this.pendingReplies=Object.create(null),window.addEventListener("message",this.handleMessage.bind(this))}registerCommandHandler(a){this._commandHandler=a}async postMessage(a){const u=String(++this.lastSentReq);return new Promise((c,d)=>{this.pendingReplies[u]={resolve:c,reject:d},a=Object.assign(a,{req:u}),re.postMessage(a)})}handleMessage(a){const u=a.data;if(u.seq){const c=this.pendingReplies[u.seq];if(c){u.err?c.reject(u.err):c.resolve(u.res);return}}this._commandHandler&&this._commandHandler(u.res)}};i(qr,"MessageHandler");let X=qr;function ue(o){return new X(o)}i(ue,"getMessageHandler");function pe(){return re.getState()}i(pe,"getState");function he(o){const a=pe();a&&a.number&&a.number===(o==null?void 0:o.number)&&(o.pendingCommentText=a.pendingCommentText),o&&re.setState(o)}i(he,"setState");function ge(o){const a=re.getState();re.setState(Object.assign(a,o))}i(ge,"updateState");var He=Object.defineProperty,ze=i((o,a,u)=>a in o?He(o,a,{enumerable:!0,configurable:!0,writable:!0,value:u}):o[a]=u,"context_defNormalProp"),oe=i((o,a,u)=>ze(o,typeof a!="symbol"?a+"":a,u),"context_publicField");const Ke=(pn=class{constructor(a=pe(),u=null,c=null){this.pr=a,this.onchange=u,this._handler=c,oe(this,"setTitle",async d=>{const p=await this.postMessage({command:"pr.edit-title",args:{text:d}});this.updatePR({titleHTML:p.titleHTML})}),oe(this,"setDescription",d=>this.postMessage({command:"pr.edit-description",args:{text:d}})),oe(this,"checkout",()=>this.postMessage({command:"pr.checkout"})),oe(this,"openChanges",d=>this.postMessage({command:"pr.open-changes",args:{openToTheSide:d}})),oe(this,"copyPrLink",()=>this.postMessage({command:"pr.copy-prlink"})),oe(this,"copyVscodeDevLink",()=>this.postMessage({command:"pr.copy-vscodedevlink"})),oe(this,"cancelCodingAgent",d=>this.postMessage({command:"pr.cancel-coding-agent",args:d})),oe(this,"exitReviewMode",async()=>{if(this.pr)return this.postMessage({command:"pr.checkout-default-branch",args:this.pr.repositoryDefaultBranch})}),oe(this,"gotoChangesSinceReview",()=>this.postMessage({command:"pr.gotoChangesSinceReview"})),oe(this,"refresh",async()=>{this.pr&&(this.pr.busy=!0),this.updatePR(this.pr),await this.postMessage({command:"pr.refresh"}),this.pr&&(this.pr.busy=!1),this.updatePR(this.pr)}),oe(this,"checkMergeability",()=>this.postMessage({command:"pr.checkMergeability"})),oe(this,"changeEmail",async d=>{const p=await this.postMessage({command:"pr.change-email",args:d});this.updatePR({emailForCommit:p})}),oe(this,"merge",async d=>await this.postMessage({command:"pr.merge",args:d})),oe(this,"openOnGitHub",()=>this.postMessage({command:"pr.openOnGitHub"})),oe(this,"deleteBranch",()=>this.postMessage({command:"pr.deleteBranch"})),oe(this,"revert",async()=>{this.updatePR({busy:!0});const d=await this.postMessage({command:"pr.revert"});this.updatePR({busy:!1,...d})}),oe(this,"readyForReview",()=>this.postMessage({command:"pr.readyForReview"})),oe(this,"addReviewers",()=>this.postMessage({command:"pr.change-reviewers"})),oe(this,"changeProjects",()=>this.postMessage({command:"pr.change-projects"})),oe(this,"removeProject",d=>this.postMessage({command:"pr.remove-project",args:d})),oe(this,"addMilestone",()=>this.postMessage({command:"pr.add-milestone"})),oe(this,"removeMilestone",()=>this.postMessage({command:"pr.remove-milestone"})),oe(this,"addAssignees",()=>this.postMessage({command:"pr.change-assignees"})),oe(this,"addAssigneeYourself",()=>this.postMessage({command:"pr.add-assignee-yourself"})),oe(this,"addAssigneeCopilot",()=>this.postMessage({command:"pr.add-assignee-copilot"})),oe(this,"addLabels",()=>this.postMessage({command:"pr.add-labels"})),oe(this,"create",()=>this.postMessage({command:"pr.open-create"})),oe(this,"deleteComment",async d=>{await this.postMessage({command:"pr.delete-comment",args:d});const{pr:p}=this;if(!p)throw new Error("Unexpectedly no pull request when trying to delete comment");const{id:y,pullRequestReviewId:C}=d;if(!C){this.updatePR({events:p.events.filter(Q=>Q.id!==y)});return}const x=p.events.findIndex(Q=>Q.id===C);if(x===-1){console.error("Could not find review:",C);return}const R=p.events[x];if(!R.comments){console.error("No comments to delete for review:",C,R);return}p.events.splice(x,1,{...R,comments:R.comments.filter(Q=>Q.id!==y)}),this.updatePR(p)}),oe(this,"editComment",d=>this.postMessage({command:"pr.edit-comment",args:d})),oe(this,"updateDraft",(d,p)=>{const C=pe().pendingCommentDrafts||Object.create(null);p!==C[d]&&(C[d]=p,this.updatePR({pendingCommentDrafts:C}))}),oe(this,"requestChanges",d=>this.submitReviewCommand("pr.request-changes",d)),oe(this,"approve",d=>this.submitReviewCommand("pr.approve",d)),oe(this,"submit",d=>this.submitReviewCommand("pr.submit",d)),oe(this,"close",async d=>{const{pr:p}=this;if(!p)throw new Error("Unexpectedly no pull request when trying to close");try{const y=await this.postMessage({command:"pr.close",args:d});let C=[...p.events];y.commentEvent&&C.push(y.commentEvent),y.closeEvent&&C.push(y.closeEvent),this.updatePR({events:C,pendingCommentText:"",state:y.state})}catch{}}),oe(this,"removeLabel",async d=>{const{pr:p}=this;if(!p)throw new Error("Unexpectedly no pull request when trying to remove label");await this.postMessage({command:"pr.remove-label",args:d});const y=p.labels.filter(C=>C.name!==d);this.updatePR({labels:y})}),oe(this,"applyPatch",async d=>{this.postMessage({command:"pr.apply-patch",args:{comment:d}})}),oe(this,"reRequestReview",async d=>{const{pr:p}=this;if(!p)throw new Error("Unexpectedly no pull request when trying to re-request review");const{reviewers:y}=await this.postMessage({command:"pr.re-request-review",args:d});p.reviewers=y,this.updatePR(p)}),oe(this,"updateBranch",async()=>{var d,p;const{pr:y}=this;if(!y)throw new Error("Unexpectedly no pull request when trying to update branch");const C=await this.postMessage({command:"pr.update-branch"});y.events=(d=C.events)!=null?d:y.events,y.mergeable=(p=C.mergeable)!=null?p:y.mergeable,this.updatePR(y)}),oe(this,"dequeue",async()=>{const{pr:d}=this;if(!d)throw new Error("Unexpectedly no pull request when trying to dequeue");await this.postMessage({command:"pr.dequeue"})&&(d.mergeQueueEntry=void 0),this.updatePR(d)}),oe(this,"enqueue",async()=>{const{pr:d}=this;if(!d)throw new Error("Unexpectedly no pull request when trying to enqueue");const p=await this.postMessage({command:"pr.enqueue"});p.mergeQueueEntry&&(d.mergeQueueEntry=p.mergeQueueEntry),this.updatePR(d)}),oe(this,"openDiff",d=>this.postMessage({command:"pr.open-diff",args:{comment:d}})),oe(this,"toggleResolveComment",(d,p,y)=>{this.postMessage({command:"pr.resolve-comment-thread",args:{threadId:d,toResolve:y,thread:p}}).then(C=>{C?this.updatePR({events:C}):this.refresh()})}),oe(this,"openSessionLog",d=>this.postMessage({command:"pr.open-session-log",args:{link:d}})),oe(this,"openCommitChanges",async d=>{this.updatePR({loadingCommit:d});try{const p={commitSha:d};await this.postMessage({command:"pr.openCommitChanges",args:p})}finally{this.updatePR({loadingCommit:void 0})}}),oe(this,"setPR",d=>(this.pr=d,he(this.pr),this.onchange&&this.onchange(this.pr),this)),oe(this,"updatePR",d=>(ge(d),this.pr=this.pr?{...this.pr,...d}:d,this.onchange&&this.onchange(this.pr),this)),oe(this,"handleMessage",d=>{var p;switch(d.command){case"pr.clear":this.setPR(void 0);return;case"pr.initialize":return this.setPR(d.pullrequest);case"update-state":return this.updatePR({state:d.state});case"pr.update-checkout-status":return this.updatePR({isCurrentlyCheckedOut:d.isCurrentlyCheckedOut});case"pr.deleteBranch":const y={};return d.branchTypes&&d.branchTypes.map(x=>{x==="local"?y.isLocalHeadDeleted=!0:(x==="remote"||x==="upstream")&&(y.isRemoteHeadDeleted=!0)}),this.updatePR(y);case"pr.enable-exit":return this.updatePR({isCurrentlyCheckedOut:!0});case"set-scroll":window.scrollTo(d.scrollPosition.x,d.scrollPosition.y);return;case"pr.scrollToPendingReview":const C=(p=document.getElementById("pending-review"))!=null?p:document.getElementById("comment-textarea");C&&(C.scrollIntoView(),C.focus());return;case"pr.submitting-review":return this.updatePR({busy:!0,lastReviewType:d.lastReviewType});case"pr.append-review":return this.appendReview(d)}}),c||(this._handler=ue(this.handleMessage))}async submitReviewCommand(a,u){try{const c=await this.postMessage({command:a,args:u});return this.appendReview(c)}catch{return this.updatePR({busy:!1})}}appendReview(a){const{pr:u}=this;if(!u)throw new Error("Unexpectedly no pull request when trying to append review");const{events:c,reviewers:d,reviewedEvent:p}=a;if(u.busy=!1,!c){this.updatePR(u);return}d&&(u.reviewers=d),u.events=c.length===0?[...u.events,p]:c,p.event===Z.Reviewed&&(u.currentUserReviewState=p.state),u.pendingCommentText="",u.pendingReviewType=void 0,this.updatePR(u)}async updateAutoMerge({autoMerge:a,autoMergeMethod:u}){const{pr:c}=this;if(!c)throw new Error("Unexpectedly no pull request when trying to update auto merge");const d=await this.postMessage({command:"pr.update-automerge",args:{autoMerge:a,autoMergeMethod:u}});c.autoMerge=d.autoMerge,c.autoMergeMethod=d.autoMergeMethod,this.updatePR(c)}postMessage(a){var u,c;return(c=(u=this._handler)==null?void 0:u.postMessage(a))!=null?c:Promise.resolve(void 0)}},i(pn,"_PRContext"),pn);oe(Ke,"instance",new Ke);let ct=Ke;const ke=(0,l.createContext)(ct.instance);var We=(o=>(o[o.Query=0]="Query",o[o.All=1]="All",o[o.LocalPullRequest=2]="LocalPullRequest",o))(We||{}),B=(o=>(o.Approve="APPROVE",o.RequestChanges="REQUEST_CHANGES",o.Comment="COMMENT",o))(B||{}),K=(o=>(o.Open="OPEN",o.Merged="MERGED",o.Closed="CLOSED",o))(K||{}),ce=(o=>(o[o.Mergeable=0]="Mergeable",o[o.NotMergeable=1]="NotMergeable",o[o.Conflict=2]="Conflict",o[o.Unknown=3]="Unknown",o[o.Behind=4]="Behind",o))(ce||{}),w=(o=>(o[o.AwaitingChecks=0]="AwaitingChecks",o[o.Locked=1]="Locked",o[o.Mergeable=2]="Mergeable",o[o.Queued=3]="Queued",o[o.Unmergeable=4]="Unmergeable",o))(w||{}),O=(o=>(o.User="User",o.Organization="Organization",o.Mannequin="Mannequin",o.Bot="Bot",o))(O||{});function ve(o){switch(o){case"Organization":return"Organization";case"Mannequin":return"Mannequin";case"Bot":return"Bot";default:return"User"}}i(ve,"toAccountType");function Te(o){var a;return Be(o)?o.id:(a=o.specialDisplayName)!=null?a:o.login}i(Te,"reviewerId");function _e(o){var a,u,c;return Be(o)?(u=(a=o.name)!=null?a:o.slug)!=null?u:o.id:(c=o.specialDisplayName)!=null?c:o.login}i(_e,"reviewerLabel");function Be(o){return!!o.org}i(Be,"isITeam");function bt(o){const a=o;return!!a.isAuthor&&!!a.isCommenter}i(bt,"isISuggestedReviewer");var Me=(o=>(o.Issue="Issue",o.PullRequest="PullRequest",o))(Me||{}),ye=(o=>(o.Success="success",o.Failure="failure",o.Neutral="neutral",o.Pending="pending",o.Unknown="unknown",o))(ye||{}),Re=(o=>(o.Comment="comment",o.Approve="approve",o.RequestChanges="requestChanges",o))(Re||{}),oo=(o=>(o[o.None=0]="None",o[o.Available=1]="Available",o[o.ReviewedWithComments=2]="ReviewedWithComments",o[o.ReviewedWithoutComments=3]="ReviewedWithoutComments",o))(oo||{});function _t(o){var a,u;const c=(a=o.submittedAt)!=null?a:o.createdAt,d=c&&Date.now()-new Date(c).getTime()<1e3*60,p=(u=o.state)!=null?u:o.event===Z.Commented?"COMMENTED":void 0;let y="";if(d)switch(p){case"APPROVED":y="Pull request approved";break;case"CHANGES_REQUESTED":y="Changes requested on pull request";break;case"COMMENTED":y="Commented on pull request";break}return y}i(_t,"ariaAnnouncementForReview");var io=ee(7007);const ii=new io.EventEmitter;function dt(o){const[a,u]=(0,l.useState)(o);return(0,l.useEffect)(()=>{a!==o&&u(o)},[o]),[a,u]}i(dt,"useStateProp");const be=i(({className:o="",src:a,title:u})=>l.createElement("span",{className:`icon ${o}`,title:u,dangerouslySetInnerHTML:{__html:a}}),"Icon"),Bn=null,Qt=l.createElement(be,{src:ee(1440)}),jn=l.createElement(be,{src:ee(4894),className:"check"}),Lr=l.createElement(be,{src:ee(1779),className:"skip"}),li=l.createElement(be,{src:ee(407)}),si=l.createElement(be,{src:ee(650)}),Vl=l.createElement(be,{src:ee(2301)}),lo=l.createElement(be,{src:ee(2362)}),Sr=l.createElement(be,{src:ee(5771)}),so=l.createElement(be,{src:ee(7165)}),ao=l.createElement(be,{src:ee(6279)}),Tr=l.createElement(be,{src:ee(346)}),$l=l.createElement(be,{src:ee(4370)}),ai=l.createElement(be,{src:ee(659)}),Un=l.createElement(be,{src:ee(4268)}),zl=l.createElement(be,{src:ee(3344)}),At=l.createElement(be,{src:ee(3962)}),uo=l.createElement(be,{src:ee(5010)}),It=l.createElement(be,{src:ee(9443),className:"pending"}),co=l.createElement(be,{src:ee(8923)}),ui=l.createElement(be,{src:ee(5493)}),St=l.createElement(be,{src:ee(5130),className:"close"}),ci=l.createElement(be,{src:ee(7411)}),di=l.createElement(be,{src:ee(340)}),Bl=l.createElement(be,{src:ee(9649)}),jl=l.createElement(be,{src:ee(2359)}),fi=l.createElement(be,{src:ee(4439)}),Ul=l.createElement(be,{src:ee(6855)}),mi=l.createElement(be,{src:ee(5064)}),ba=l.createElement(be,{src:ee(628)}),pi=l.createElement(be,{src:ee(459)}),Wn=l.createElement(be,{src:ee(596)}),hi=l.createElement(be,{src:ee(3027)}),vi=l.createElement(be,{src:ee(27)}),gi=l.createElement(be,{src:ee(4674)}),yi=l.createElement(be,{src:ee(2158)}),Ci=l.createElement(be,{src:ee(2481)}),wi=l.createElement(be,{src:ee(5013)}),fo=l.createElement(be,{src:ee(3492)}),nn=l.createElement(be,{className:"loading",src:ee(5570)}),xi=l.createElement(be,{className:"copilot-icon",src:ee(9336)}),qn=l.createElement(be,{className:"copilot-icon",src:ee(4339)}),Mr=l.createElement(be,{className:"copilot-icon",src:ee(8726)});function Cn(){const[o,a]=(0,l.useState)([0,0]);return(0,l.useLayoutEffect)(()=>{function u(){a([window.innerWidth,window.innerHeight])}return i(u,"updateSize"),window.addEventListener("resize",u),u(),()=>window.removeEventListener("resize",u)},[]),o}i(Cn,"useWindowSize");const Zn=i(({optionsContext:o,defaultOptionLabel:a,defaultOptionValue:u,defaultAction:c,allOptions:d,optionsTitle:p,disabled:y,hasSingleAction:C,spreadable:x,isSecondary:R})=>{const[Q,F]=(0,l.useState)(!1),le=i(P=>{P.target instanceof HTMLElement&&P.target.classList.contains("split-right")||F(!1)},"onHideAction");(0,l.useEffect)(()=>{const P=i(Pe=>le(Pe),"onClickOrKey");Q?(document.addEventListener("click",P),document.addEventListener("keydown",P)):(document.removeEventListener("click",P),document.removeEventListener("keydown",P))},[Q,F]);const me=(0,l.useRef)();return Cn(),l.createElement("div",{className:`dropdown-container${x?" spreadable":""}`,ref:me},me.current&&x&&me.current.clientWidth>375&&d&&!C?d().map(({label:P,value:Pe,action:Ce,optionDisabled:xe})=>l.createElement("button",{className:"inlined-dropdown",key:Pe,title:P,disabled:xe||y,onClick:Ce,value:Pe},P)):l.createElement("div",{className:"primary-split-button"},l.createElement("button",{className:`split-left${R?" secondary":""}`,disabled:y,onClick:c,value:u(),title:typeof a()=="string"?a():p},a()),C?null:l.createElement("div",{className:`split${R?" secondary":""}${y?" disabled":""}`},l.createElement("div",{className:`separator${y?" disabled":""}`})),C?null:l.createElement("button",{className:`split-right${R?" secondary":""}`,title:p,disabled:y,"aria-expanded":Q,onClick:i(P=>{P.preventDefault();const Pe=P.target.getBoundingClientRect(),Ce=Pe.left,xe=Pe.bottom;P.target.dispatchEvent(new MouseEvent("contextmenu",{bubbles:!0,clientX:Ce,clientY:xe})),P.stopPropagation()},"onClick"),onMouseDown:i(()=>F(!0),"onMouseDown"),onKeyDown:i(P=>{(P.key==="Enter"||P.key===" ")&&F(!0)},"onKeyDown"),"data-vscode-context":o()},si)))},"contextDropdown_ContextDropdown"),lt="\xA0",Nr=i(({children:o})=>{const a=l.Children.count(o);return l.createElement(l.Fragment,{children:l.Children.map(o,(u,c)=>typeof u=="string"?`${c>0?lt:""}${u}${c<a-1&&typeof o[c+1]!="string"?lt:""}`:u)})},"Spaced");var Wl=ee(7975),Ei=ee(4353),Qn=ee.n(Ei),bi=ee(8660),Kn=ee.n(bi),ki=ee(3581),mo=ee.n(ki),rn=Object.defineProperty,_i=i((o,a,u)=>a in o?rn(o,a,{enumerable:!0,configurable:!0,writable:!0,value:u}):o[a]=u,"lifecycle_defNormalProp"),po=i((o,a,u)=>_i(o,typeof a!="symbol"?a+"":a,u),"lifecycle_publicField");function ql(o){return{dispose:o}}i(ql,"toDisposable");function Zl(o){return ql(()=>on(o))}i(Zl,"lifecycle_combinedDisposable");function on(o){for(;o.length;){const a=o.pop();a==null||a.dispose()}}i(on,"disposeAll");function Li(o,a){return a.push(o),o}i(Li,"addDisposable");const On=class On{constructor(){po(this,"_isDisposed",!1),po(this,"_disposables",[])}dispose(){this._isDisposed||(this._isDisposed=!0,on(this._disposables),this._disposables=[])}_register(a){return this._isDisposed?a.dispose():this._disposables.push(a),a}get isDisposed(){return this._isDisposed}};i(On,"Disposable");let wn=On;var Ql=Object.defineProperty,Rr=i((o,a,u)=>a in o?Ql(o,a,{enumerable:!0,configurable:!0,writable:!0,value:u}):o[a]=u,"utils_defNormalProp"),Je=i((o,a,u)=>Rr(o,typeof a!="symbol"?a+"":a,u),"utils_publicField");Qn().extend(Kn(),{thresholds:[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:6,d:"day"},{l:"w",r:7},{l:"ww",r:3,d:"week"},{l:"M",r:4},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}]}),Qn().extend(mo()),Qn().updateLocale("en",{relativeTime:{future:"in %s",past:"%s ago",s:"seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",w:"a week",ww:"%d weeks",M:"a month",MM:"%d months",y:"a year",yy:"%d years"}});function Kl(o,a){const u=Object.create(null);return o.filter(c=>{const d=a(c);return u[d]?!1:(u[d]=!0,!0)})}i(Kl,"uniqBy");function ho(...o){return(a,u=null,c)=>{const d=combinedDisposable(o.map(p=>p(y=>a.call(u,y))));return c&&c.push(d),d}}i(ho,"anyEvent");function Yl(o,a){return(u,c=null,d)=>o(p=>a(p)&&u.call(c,p),null,d)}i(Yl,"filterEvent");function Gl(o){return(a,u=null,c)=>{const d=o(p=>(d.dispose(),a.call(u,p)),null,c);return d}}i(Gl,"onceEvent");function Si(o){return/^[a-zA-Z]:\\/.test(o)}i(Si,"isWindowsPath");function Ti(o,a,u=sep){return o===a?!0:(o.charAt(o.length-1)!==u&&(o+=u),Si(o)&&(o=o.toLowerCase(),a=a.toLowerCase()),a.startsWith(o))}i(Ti,"isDescendant");function vo(o,a){return o.reduce((u,c)=>{const d=a(c);return u[d]=[...u[d]||[],c],u},Object.create(null))}i(vo,"groupBy");const Zr=class Zr extends Error{constructor(a){super(`Unreachable case: ${a}`)}};i(Zr,"UnreachableCaseError");let Yn=Zr;function Mi(o){return!!o.errors}i(Mi,"isHookError");function go(o){let a=!0;if(o.errors&&Array.isArray(o.errors)){for(const u of o.errors)if(!u.field||!u.value||!u.status){a=!1;break}}else a=!1;return a}i(go,"hasFieldErrors");function Bt(o){if(!(o instanceof Error))return typeof o=="string"?o:o.gitErrorCode?`${o.message}. Please check git output for more details`:o.stderr?`${o.stderr}. Please check git output for more details`:"Error";let a=o.message,u;if(o.message==="Validation Failed"&&go(o))u=o.errors.map(c=>`Value "${c.value}" cannot be set for field ${c.field} (code: ${c.status})`).join(", ");else{if(o.message.startsWith("Validation Failed:"))return o.message;if(Mi(o)&&o.errors)return o.errors.map(c=>typeof c=="string"?c:c.message).join(", ")}return u&&(a=`${a}: ${u}`),a}i(Bt,"formatError");async function ln(o){return new Promise(a=>{const u=o(c=>{u.dispose(),a(c)})})}i(ln,"asPromise");async function sn(o,a){return Promise.race([o,new Promise(u=>{setTimeout(()=>u(void 0),a)})])}i(sn,"promiseWithTimeout");function Tt(o){const a=Qn()(o),u=Date.now();return a.diff(u,"month"),a.diff(u,"month")<1?a.fromNow():a.diff(u,"year")<1?`on ${a.format("MMM D")}`:`on ${a.format("MMM D, YYYY")}`}i(Tt,"dateFromNow");function Ht(o,a,u=!1){o.startsWith("#")&&(o=o.substring(1));const c=En(o);if(a){const d=yo(c.r,c.g,c.b),p=.6,y=.18,C=.3,x=(c.r*.2126+c.g*.7152+c.b*.0722)/255,R=Math.max(0,Math.min((x-p)*-1e3,1)),Q=(p-x)*100*R,F=En(Ni(d.h,d.s,d.l+Q)),le=`#${Ni(d.h,d.s,d.l+Q)}`,me=u?`#${xn({...c,a:y})}`:`rgba(${c.r},${c.g},${c.b},${y})`,P=u?`#${xn({...F,a:C})}`:`rgba(${F.r},${F.g},${F.b},${C})`;return{textColor:le,backgroundColor:me,borderColor:P}}else return{textColor:`#${Xl(c)}`,backgroundColor:`#${o}`,borderColor:`#${o}`}}i(Ht,"utils_gitHubLabelColor");const xn=i(o=>{const a=[o.r,o.g,o.b];return o.a&&a.push(Math.floor(o.a*255)),a.map(u=>u.toString(16).padStart(2,"0")).join("")},"rgbToHex");function En(o){const a=/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(o);return a?{r:parseInt(a[1],16),g:parseInt(a[2],16),b:parseInt(a[3],16)}:{r:0,g:0,b:0}}i(En,"hexToRgb");function yo(o,a,u){o/=255,a/=255,u/=255;let c=Math.min(o,a,u),d=Math.max(o,a,u),p=d-c,y=0,C=0,x=0;return p==0?y=0:d==o?y=(a-u)/p%6:d==a?y=(u-o)/p+2:y=(o-a)/p+4,y=Math.round(y*60),y<0&&(y+=360),x=(d+c)/2,C=p==0?0:p/(1-Math.abs(2*x-1)),C=+(C*100).toFixed(1),x=+(x*100).toFixed(1),{h:y,s:C,l:x}}i(yo,"rgbToHsl");function Ni(o,a,u){const c=u/100,d=a*Math.min(c,1-c)/100,p=i(y=>{const C=(y+o/30)%12,x=c-d*Math.max(Math.min(C-3,9-C,1),-1);return Math.round(255*x).toString(16).padStart(2,"0")},"f");return`${p(0)}${p(8)}${p(4)}`}i(Ni,"hslToHex");function Xl(o){return(.299*o.r+.587*o.g+.114*o.b)/255>.5?"000000":"ffffff"}i(Xl,"contrastColor");var Co=(o=>(o[o.Period=46]="Period",o[o.Slash=47]="Slash",o[o.A=65]="A",o[o.Z=90]="Z",o[o.Backslash=92]="Backslash",o[o.a=97]="a",o[o.z=122]="z",o))(Co||{});function wo(o,a){return o<a?-1:o>a?1:0}i(wo,"compare");function an(o,a,u=0,c=o.length,d=0,p=a.length){for(;u<c&&d<p;u++,d++){const x=o.charCodeAt(u),R=a.charCodeAt(d);if(x<R)return-1;if(x>R)return 1}const y=c-u,C=p-d;return y<C?-1:y>C?1:0}i(an,"compareSubstring");function Ri(o,a){return xo(o,a,0,o.length,0,a.length)}i(Ri,"compareIgnoreCase");function xo(o,a,u=0,c=o.length,d=0,p=a.length){for(;u<c&&d<p;u++,d++){let x=o.charCodeAt(u),R=a.charCodeAt(d);if(x===R)continue;const Q=x-R;if(!(Q===32&&Eo(R))&&!(Q===-32&&Eo(x)))return Gn(x)&&Gn(R)?Q:an(o.toLowerCase(),a.toLowerCase(),u,c,d,p)}const y=c-u,C=p-d;return y<C?-1:y>C?1:0}i(xo,"compareSubstringIgnoreCase");function Gn(o){return o>=97&&o<=122}i(Gn,"isLowerAsciiLetter");function Eo(o){return o>=65&&o<=90}i(Eo,"isUpperAsciiLetter");const Wo=class Wo{constructor(){Je(this,"_value",""),Je(this,"_pos",0)}reset(a){return this._value=a,this._pos=0,this}next(){return this._pos+=1,this}hasNext(){return this._pos<this._value.length-1}cmp(a){const u=a.charCodeAt(0),c=this._value.charCodeAt(this._pos);return u-c}value(){return this._value[this._pos]}};i(Wo,"StringIterator");let bo=Wo;const mr=class mr{constructor(a=!0){this._caseSensitive=a,Je(this,"_value"),Je(this,"_from"),Je(this,"_to")}reset(a){return this._value=a,this._from=0,this._to=0,this.next()}hasNext(){return this._to<this._value.length}next(){this._from=this._to;let a=!0;for(;this._to<this._value.length;this._to++)if(this._value.charCodeAt(this._to)===46)if(a)this._from++;else break;else a=!1;return this}cmp(a){return this._caseSensitive?an(a,this._value,0,a.length,this._from,this._to):xo(a,this._value,0,a.length,this._from,this._to)}value(){return this._value.substring(this._from,this._to)}};i(mr,"ConfigKeysIterator");let un=mr;const Qr=class Qr{constructor(a=!0,u=!0){this._splitOnBackslash=a,this._caseSensitive=u,Je(this,"_value"),Je(this,"_from"),Je(this,"_to")}reset(a){return this._value=a.replace(/\\$|\/$/,""),this._from=0,this._to=0,this.next()}hasNext(){return this._to<this._value.length}next(){this._from=this._to;let a=!0;for(;this._to<this._value.length;this._to++){const u=this._value.charCodeAt(this._to);if(u===47||this._splitOnBackslash&&u===92)if(a)this._from++;else break;else a=!1}return this}cmp(a){return this._caseSensitive?an(a,this._value,0,a.length,this._from,this._to):xo(a,this._value,0,a.length,this._from,this._to)}value(){return this._value.substring(this._from,this._to)}};i(Qr,"PathIterator");let Xn=Qr;var Pi=(o=>(o[o.Scheme=1]="Scheme",o[o.Authority=2]="Authority",o[o.Path=3]="Path",o[o.Query=4]="Query",o[o.Fragment=5]="Fragment",o))(Pi||{});const Kr=class Kr{constructor(a){this._ignorePathCasing=a,Je(this,"_pathIterator"),Je(this,"_value"),Je(this,"_states",[]),Je(this,"_stateIdx",0)}reset(a){return this._value=a,this._states=[],this._value.scheme&&this._states.push(1),this._value.authority&&this._states.push(2),this._value.path&&(this._pathIterator=new Xn(!1,!this._ignorePathCasing(a)),this._pathIterator.reset(a.path),this._pathIterator.value()&&this._states.push(3)),this._value.query&&this._states.push(4),this._value.fragment&&this._states.push(5),this._stateIdx=0,this}next(){return this._states[this._stateIdx]===3&&this._pathIterator.hasNext()?this._pathIterator.next():this._stateIdx+=1,this}hasNext(){return this._states[this._stateIdx]===3&&this._pathIterator.hasNext()||this._stateIdx<this._states.length-1}cmp(a){if(this._states[this._stateIdx]===1)return Ri(a,this._value.scheme);if(this._states[this._stateIdx]===2)return Ri(a,this._value.authority);if(this._states[this._stateIdx]===3)return this._pathIterator.cmp(a);if(this._states[this._stateIdx]===4)return wo(a,this._value.query);if(this._states[this._stateIdx]===5)return wo(a,this._value.fragment);throw new Error}value(){if(this._states[this._stateIdx]===1)return this._value.scheme;if(this._states[this._stateIdx]===2)return this._value.authority;if(this._states[this._stateIdx]===3)return this._pathIterator.value();if(this._states[this._stateIdx]===4)return this._value.query;if(this._states[this._stateIdx]===5)return this._value.fragment;throw new Error}};i(Kr,"UriIterator");let Pr=Kr;function Oi(o){const u=o.extensionUri.path,c=u.lastIndexOf(".");return c===-1?!1:u.substr(c+1).length>1}i(Oi,"isPreRelease");const pr=class pr{constructor(){Je(this,"segment"),Je(this,"value"),Je(this,"key"),Je(this,"left"),Je(this,"mid"),Je(this,"right")}isEmpty(){return!this.left&&!this.mid&&!this.right&&!this.value}};i(pr,"TernarySearchTreeNode");let bn=pr;const hn=class hn{constructor(a){Je(this,"_iter"),Je(this,"_root"),this._iter=a}static forUris(a=()=>!1){return new hn(new Pr(a))}static forPaths(){return new hn(new Xn)}static forStrings(){return new hn(new bo)}static forConfigKeys(){return new hn(new un)}clear(){this._root=void 0}set(a,u){const c=this._iter.reset(a);let d;for(this._root||(this._root=new bn,this._root.segment=c.value()),d=this._root;;){const y=c.cmp(d.segment);if(y>0)d.left||(d.left=new bn,d.left.segment=c.value()),d=d.left;else if(y<0)d.right||(d.right=new bn,d.right.segment=c.value()),d=d.right;else if(c.hasNext())c.next(),d.mid||(d.mid=new bn,d.mid.segment=c.value()),d=d.mid;else break}const p=d.value;return d.value=u,d.key=a,p}get(a){var u;return(u=this._getNode(a))==null?void 0:u.value}_getNode(a){const u=this._iter.reset(a);let c=this._root;for(;c;){const d=u.cmp(c.segment);if(d>0)c=c.left;else if(d<0)c=c.right;else if(u.hasNext())u.next(),c=c.mid;else break}return c}has(a){const u=this._getNode(a);return!((u==null?void 0:u.value)===void 0&&(u==null?void 0:u.mid)===void 0)}delete(a){return this._delete(a,!1)}deleteSuperstr(a){return this._delete(a,!0)}_delete(a,u){const c=this._iter.reset(a),d=[];let p=this._root;for(;p;){const y=c.cmp(p.segment);if(y>0)d.push([1,p]),p=p.left;else if(y<0)d.push([-1,p]),p=p.right;else if(c.hasNext())c.next(),d.push([0,p]),p=p.mid;else{for(u?(p.left=void 0,p.mid=void 0,p.right=void 0):p.value=void 0;d.length>0&&p.isEmpty();){let[C,x]=d.pop();switch(C){case 1:x.left=void 0;break;case 0:x.mid=void 0;break;case-1:x.right=void 0;break}p=x}break}}}findSubstr(a){const u=this._iter.reset(a);let c=this._root,d;for(;c;){const p=u.cmp(c.segment);if(p>0)c=c.left;else if(p<0)c=c.right;else if(u.hasNext())u.next(),d=c.value||d,c=c.mid;else break}return c&&c.value||d}findSuperstr(a){const u=this._iter.reset(a);let c=this._root;for(;c;){const d=u.cmp(c.segment);if(d>0)c=c.left;else if(d<0)c=c.right;else if(u.hasNext())u.next(),c=c.mid;else return c.mid?this._entries(c.mid):void 0}}forEach(a){for(const[u,c]of this)a(c,u)}*[Symbol.iterator](){yield*this._entries(this._root)}*_entries(a){a&&(yield*this._entries(a.left),a.value&&(yield[a.key,a.value]),yield*this._entries(a.mid),yield*this._entries(a.right))}};i(hn,"TernarySearchTree");let Or=hn;async function Jl(o,a,u){const c=[];o.replace(a,(y,...C)=>{const x=u(y,...C);return c.push(x),""});const d=await Promise.all(c);let p=0;return o.replace(a,()=>d[p++])}i(Jl,"stringReplaceAsync");async function Di(o,a,u){const c=Math.ceil(o.length/a);for(let d=0;d<c;d++){const p=o.slice(d*a,(d+1)*a);await Promise.all(p.map(u))}}i(Di,"batchPromiseAll");function ka(o){return o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}i(ka,"escapeRegExp");const Mt=i(({date:o,href:a})=>{const[u,c]=(0,l.useState)(Tt(o)),d=typeof o=="string"?new Date(o).toLocaleString():o.toLocaleString();return(0,l.useEffect)(()=>{c(Tt(o));const y=i(()=>{const F=Date.now(),le=typeof o=="string"?new Date(o).getTime():o.getTime(),me=(F-le)/(1e3*60);return me<1?2e4:me<60?2*6e4:me<60*24?10*6e4:null},"getUpdateInterval")();if(y===null)return;let C;const x=i(()=>{document.visibilityState==="visible"&&c(Tt(o))},"updateTimeString"),R=i(()=>{C=window.setInterval(x,y)},"startInterval"),Q=i(()=>{document.visibilityState==="visible"?(c(Tt(o)),C&&clearInterval(C),R()):C&&clearInterval(C)},"handleVisibilityChange");return R(),document.addEventListener("visibilitychange",Q),()=>{C&&clearInterval(C),document.removeEventListener("visibilitychange",Q)}},[o]),a?l.createElement("a",{href:a,className:"timestamp",title:d},u):l.createElement("div",{className:"timestamp",title:d},u)},"Timestamp"),ko=null,Ye=i(({for:o})=>l.createElement(l.Fragment,null,o.avatarUrl?l.createElement("img",{className:"avatar",src:o.avatarUrl,alt:"",role:"presentation","aria-hidden":"true"}):l.createElement(be,{className:"avatar-icon",src:ee(8440)})),"InnerAvatar"),st=i(({for:o,link:a=!0,substituteIcon:u})=>a?l.createElement("a",{className:"avatar-link",href:o.url,title:o.url,"aria-hidden":"true"},u!=null?u:l.createElement(Ye,{for:o})):u!=null?u:l.createElement(Ye,{for:o}),"Avatar"),ht=i(({for:o,text:a=_e(o)})=>l.createElement("a",{className:"author-link",href:o.url,"aria-label":a,title:o.url},a),"AuthorLink"),es=i(({authorAssociation:o},a=u=>`(${u.toLowerCase()})`)=>o.toLowerCase()==="user"?a("you"):o&&o!=="NONE"?a(o):null,"association");function cn(o){var a;const{isPRDescription:u,children:c,comment:d,headerInEditMode:p}=o,{bodyHTML:y,body:C}=d,x=(a=d.id)!=null?a:-1,R=!!d.canEdit,Q=!!d.canDelete,F=d.pullRequestReviewId,[le,me]=dt(C),[P,Pe]=dt(y),{deleteComment:Ce,editComment:xe,setDescription:je,pr:Ie}=(0,l.useContext)(ke),Le=(Ie==null?void 0:Ie.pendingCommentDrafts)&&Ie.pendingCommentDrafts[x],[Xe,Ee]=(0,l.useState)(!!Le),[qe,vt]=(0,l.useState)(!1);if(Xe)return l.cloneElement(p?l.createElement(_o,{for:d}):l.createElement(l.Fragment,null),{},[l.createElement(ns,{id:x,key:`editComment${x}`,body:Le||le,onCancel:i(()=>{Ie!=null&&Ie.pendingCommentDrafts&&delete Ie.pendingCommentDrafts[x],Ee(!1)},"onCancel"),onSave:i(async Ze=>{try{const it=u?await je(Ze):await xe({comment:d,text:Ze});Pe(it.bodyHTML),me(Ze)}finally{Ee(!1)}},"onSave")})]);const Nt=d.event===Z.Commented||d.event===Z.Reviewed?_t(d):void 0;return l.createElement(_o,{for:d,onMouseEnter:i(()=>vt(!0),"onMouseEnter"),onMouseLeave:i(()=>vt(!1),"onMouseLeave"),onFocus:i(()=>vt(!0),"onFocus")},Nt?l.createElement("div",{role:"alert","aria-label":Nt}):null,l.createElement("div",{className:"action-bar comment-actions",style:{display:qe?"flex":"none"}},l.createElement("button",{title:"Quote reply",className:"icon-button",onClick:i(()=>ii.emit("quoteReply",le),"onClick")},lo),R?l.createElement("button",{title:"Edit comment",className:"icon-button",onClick:i(()=>Ee(!0),"onClick")},At):null,Q?l.createElement("button",{title:"Delete comment",className:"icon-button",onClick:i(()=>Ce({id:x,pullRequestReviewId:F}),"onClick")},ao):null),l.createElement(Lo,{comment:d,bodyHTML:P,body:le,canApplyPatch:!!(Ie!=null&&Ie.isCurrentlyCheckedOut),allowEmpty:!!o.allowEmpty,specialDisplayBodyPostfix:d.specialDisplayBodyPostfix}),c)}i(cn,"CommentView");function kn(o){return o.authorAssociation!==void 0}i(kn,"isReviewEvent");function Jn(o){return o&&typeof o=="object"&&typeof o.body=="string"&&typeof o.diffHunk=="string"}i(Jn,"isIComment");const ts={PENDING:"will review",COMMENTED:"reviewed",CHANGES_REQUESTED:"requested changes",APPROVED:"approved"},Ai=i(o=>ts[o]||"reviewed","reviewDescriptor");function _o({for:o,onFocus:a,onMouseEnter:u,onMouseLeave:c,children:d}){var p,y,C,x,R;const Q=o,F=(p=Q.htmlUrl)!=null?p:o.url,le=(C=Jn(o)&&o.isDraft)!=null?C:kn(o)&&((y=o.state)==null?void 0:y.toLocaleUpperCase())==="PENDING",me=(x=Q.user)!=null?x:o.author,P=(R=o.createdAt)!=null?R:o.submittedAt;return l.createElement("div",{className:"comment-container comment review-comment",onFocus:a,onMouseEnter:u,onMouseLeave:c},l.createElement("div",{className:"review-comment-container"},l.createElement("h3",{className:`review-comment-header${kn(o)&&o.comments.length>0?"":" no-details"}`},l.createElement(Nr,null,l.createElement(st,{for:me}),l.createElement(ht,{for:me}),kn(o)?es(o):null,P?l.createElement(l.Fragment,null,kn(o)&&o.state?Ai(o.state):"commented",lt,l.createElement(Mt,{href:F,date:P})):l.createElement("em",null,"pending"),le?l.createElement(l.Fragment,null,l.createElement("span",{className:"pending-label"},"Pending")):null)),d))}i(_o,"CommentBox");function ns({id:o,body:a,onCancel:u,onSave:c}){const{updateDraft:d}=(0,l.useContext)(ke),p=(0,l.useRef)({body:a,dirty:!1}),y=(0,l.useRef)();(0,l.useEffect)(()=>{const F=setInterval(()=>{p.current.dirty&&(d(o,p.current.body),p.current.dirty=!1)},500);return()=>clearInterval(F)},[p]);const C=(0,l.useCallback)(async()=>{const{markdown:F,submitButton:le}=y.current;le.disabled=!0;try{await c(F.value)}finally{le.disabled=!1}},[y,c]),x=(0,l.useCallback)(F=>{F.preventDefault(),C()},[C]),R=(0,l.useCallback)(F=>{(F.metaKey||F.ctrlKey)&&F.key==="Enter"&&(F.preventDefault(),C())},[C]),Q=(0,l.useCallback)(F=>{p.current.body=F.target.value,p.current.dirty=!0},[p]);return l.createElement("form",{ref:y,onSubmit:x},l.createElement("textarea",{name:"markdown",defaultValue:a,onKeyDown:R,onInput:Q}),l.createElement("div",{className:"form-actions"},l.createElement("button",{className:"secondary",onClick:u},"Cancel"),l.createElement("button",{type:"submit",name:"submitButton"},"Save")))}i(ns,"EditComment");const Lo=i(({comment:o,bodyHTML:a,body:u,canApplyPatch:c,allowEmpty:d,specialDisplayBodyPostfix:p})=>{var y,C;if(!u&&!a)return d?null:l.createElement("div",{className:"comment-body"},l.createElement("em",null,"No description provided."));const{applyPatch:x}=(0,l.useContext)(ke),R=l.createElement("div",{dangerouslySetInnerHTML:{__html:a!=null?a:""}}),F=((C=(y=u||a)==null?void 0:y.indexOf("```diff"))!=null?C:-1)>-1&&c&&o?l.createElement("button",{onClick:i(()=>x(o),"onClick")},"Apply Patch"):l.createElement(l.Fragment,null);return l.createElement("div",{className:"comment-body"},R,F,p?l.createElement("br",null):null,p?l.createElement("em",null,p):null,l.createElement(So,{reactions:o==null?void 0:o.reactions}))},"CommentBody"),So=i(({reactions:o})=>{if(!Array.isArray(o)||o.length===0)return null;const a=o.filter(u=>u.count>0);return a.length===0?null:l.createElement("div",{className:"comment-reactions",style:{marginTop:6}},a.map((u,c)=>{const p=u.reactors||[],y=p.slice(0,10),C=p.length>10?p.length-10:0;let x="";return y.length>0&&(C>0?x=`${Mo(y)} and ${C} more reacted with ${u.label}`:x=`${Mo(y)} reacted with ${u.label}`),l.createElement("div",{key:u.label+c,title:x},l.createElement("span",{className:"reaction-label"},u.label),lt,u.count>1?l.createElement("span",{className:"reaction-count"},u.count):null)}))},"CommentReactions");function Ii({pendingCommentText:o,isCopilotOnMyBehalf:a,state:u,hasWritePermission:c,isIssue:d,isAuthor:p,continueOnGitHub:y,currentUserReviewState:C,lastReviewType:x,busy:R,hasReviewDraft:Q}){const{updatePR:F,requestChanges:le,approve:me,close:P,openOnGitHub:Pe,submit:Ce}=(0,l.useContext)(ke),[xe,je]=(0,l.useState)(!1),Ie=(0,l.useRef)(),Le=(0,l.useRef)();ii.addListener("quoteReply",Qe=>{var at,qt;const sl=Qe.replace(/\n/g,`
> `);F({pendingCommentText:`> ${sl} 

`}),(at=Le.current)==null||at.scrollIntoView(),(qt=Le.current)==null||qt.focus()});const Xe=i(Qe=>{Qe.preventDefault();const{value:at}=Le.current;P(at)},"closeButton");let Ee=x!=null?x:C==="APPROVED"?Re.Approve:C==="CHANGES_REQUESTED"?Re.RequestChanges:Re.Comment;async function qe(Qe){const{value:at}=Le.current;if(y&&Qe!==Re.Comment){await Pe();return}switch(je(!0),Qe){case Re.RequestChanges:await le(at);break;case Re.Approve:await me(at);break;default:await Ce(at)}je(!1)}i(qe,"submitAction");const vt=(0,l.useCallback)(Qe=>{(Qe.metaKey||Qe.ctrlKey)&&Qe.key==="Enter"&&qe(Ee)},[Ce]);async function Nt(){await qe(Ee)}i(Nt,"defaultSubmitAction");const Ze=p?{[Re.Comment]:"Comment"}:y?{[Re.Comment]:"Comment",[Re.Approve]:"Approve on github.com",[Re.RequestChanges]:"Request changes on github.com"}:Ft(d),it=!(o!=null&&o.trim())&&!Q,An=!1;return l.createElement("form",{id:"comment-form",ref:Ie,className:"comment-form main-comment-form"},l.createElement("textarea",{id:"comment-textarea",name:"body",ref:Le,onInput:i(({target:Qe})=>F({pendingCommentText:Qe.value}),"onInput"),onKeyDown:vt,value:o,placeholder:"Leave a comment",onClick:i(()=>{var Qe;!o&&a&&!((Qe=Le.current)!=null&&Qe.textContent)&&(Le.current.textContent="@copilot ",Le.current.setSelectionRange(9,9))},"onClick")}),l.createElement("div",{className:"form-actions"},c||p?l.createElement("button",{id:"close",className:"secondary",disabled:xe||u!==K.Open,onClick:Xe,"data-command":"close"},d?"Close Issue":"Close Pull Request"):null,l.createElement(Zn,{optionsContext:i(()=>To(Ze,o,it),"optionsContext"),defaultAction:Nt,defaultOptionLabel:i(()=>Ze[Ee],"defaultOptionLabel"),defaultOptionValue:i(()=>Ee,"defaultOptionValue"),allOptions:i(()=>{const Qe=[];return Ze.approve&&Qe.push({label:Ze[Re.Approve],value:Re.Approve,action:i(()=>qe(Re.Approve),"action"),optionDisabled:An}),Ze.comment&&Qe.push({label:Ze[Re.Comment],value:Re.Comment,action:i(()=>qe(Re.Comment),"action"),optionDisabled:it}),Ze.requestChanges&&Qe.push({label:Ze[Re.RequestChanges],value:Re.RequestChanges,action:i(()=>qe(Re.RequestChanges),"action"),optionDisabled:it}),Qe},"allOptions"),optionsTitle:"Submit pull request review",disabled:xe||R,hasSingleAction:Object.keys(Ze).length===1,spreadable:!0})))}i(Ii,"AddComment");function Ft(o){return o?er:tr}i(Ft,"commentMethods");const er={comment:"Comment"},tr={...er,approve:"Approve",requestChanges:"Request Changes"},To=i((o,a,u)=>{const c={preventDefaultContextMenuItems:!0,"github:reviewCommentMenu":!0};return o.approve&&(o.approve===tr.approve?c["github:reviewCommentApprove"]=!0:c["github:reviewCommentApproveOnDotCom"]=!0),o.comment&&(c["github:reviewCommentComment"]=!0,u||(c["github:reviewCommentCommentEnabled"]=!0)),o.requestChanges&&(o.requestChanges===tr.requestChanges?(c["github:reviewCommentRequestChanges"]=!0,u||(c["github:reviewRequestChangesEnabled"]=!0)):c["github:reviewCommentRequestChangesOnDotCom"]=!0),c.body=a!=null?a:"",JSON.stringify(c)},"makeCommentMenuContext"),rs=i(o=>{var a,u,c;const{updatePR:d,requestChanges:p,approve:y,submit:C,openOnGitHub:x}=useContext(PullRequestContext),[R,Q]=useState(!1),F=useRef();let le=(a=o.lastReviewType)!=null?a:o.currentUserReviewState==="APPROVED"?ReviewType.Approve:o.currentUserReviewState==="CHANGES_REQUESTED"?ReviewType.RequestChanges:ReviewType.Comment;async function me(Le){const{value:Xe}=F.current;if(o.continueOnGitHub&&Le!==ReviewType.Comment){await x();return}switch(Q(!0),Le){case ReviewType.RequestChanges:await p(Xe);break;case ReviewType.Approve:await y(Xe);break;default:await C(Xe)}Q(!1)}i(me,"submitAction");async function P(){await me(le)}i(P,"defaultSubmitAction");const Pe=i(Le=>{d({pendingCommentText:Le.target.value})},"onChangeTextarea"),Ce=useCallback(Le=>{(Le.metaKey||Le.ctrlKey)&&Le.key==="Enter"&&(Le.preventDefault(),P())},[me]),xe=o.isAuthor?{comment:"Comment"}:o.continueOnGitHub?{comment:"Comment",approve:"Approve on github.com",requestChanges:"Request changes on github.com"}:Ft(o.isIssue),je=!((u=o.pendingCommentText)!=null&&u.trim())&&!o.hasReviewDraft,Ie=!1;return React.createElement("span",{className:"comment-form"},React.createElement("textarea",{id:"comment-textarea",name:"body",placeholder:"Leave a comment",ref:F,value:(c=o.pendingCommentText)!=null?c:"",onChange:Pe,onKeyDown:Ce,disabled:R||o.busy}),React.createElement("div",{className:"comment-button"},React.createElement(ContextDropdown,{optionsContext:i(()=>To(xe,o.pendingCommentText,je),"optionsContext"),defaultAction:P,defaultOptionLabel:i(()=>xe[le],"defaultOptionLabel"),defaultOptionValue:i(()=>le,"defaultOptionValue"),allOptions:i(()=>{const Le=[];return xe.approve&&Le.push({label:xe[ReviewType.Approve],value:ReviewType.Approve,action:i(()=>me(ReviewType.Approve),"action"),optionDisabled:Ie}),xe.comment&&Le.push({label:xe[ReviewType.Comment],value:ReviewType.Comment,action:i(()=>me(ReviewType.Comment),"action"),optionDisabled:je}),xe.requestChanges&&Le.push({label:xe[ReviewType.RequestChanges],value:ReviewType.RequestChanges,action:i(()=>me(ReviewType.RequestChanges),"action"),optionDisabled:je}),Le},"allOptions"),optionsTitle:"Submit pull request review",disabled:R||o.busy,hasSingleAction:Object.keys(xe).length===1,spreadable:!0})))},"AddCommentSimple");function Mo(o){return o.length===0?"":o.length===1?o[0]:o.length===2?`${o[0]} and ${o[1]}`:`${o.slice(0,-1).join(", ")} and ${o[o.length-1]}`}i(Mo,"joinWithAnd");const Hi="copilot-swe-agent",No="copilot-pull-request-reviewer",os="BOT_kgDOCnlnWA",Fi=[No,Hi,"Copilot"];var dn=(o=>(o[o.None=0]="None",o[o.Started=1]="Started",o[o.Completed=2]="Completed",o[o.Failed=3]="Failed",o))(dn||{});function nr(o){if(!o)return 0;switch(o.event){case Z.CopilotStarted:return 1;case Z.CopilotFinished:return 2;case Z.CopilotFinishedError:return 3;default:return 0}}i(nr,"copilotEventToStatus");function Ro(o){for(let a=o.length-1;a>=0;a--)if(nr(o[a])!==0)return o[a]}i(Ro,"mostRecentCopilotEvent");function Po({canEdit:o,state:a,head:u,base:c,title:d,titleHTML:p,number:y,url:C,author:x,isCurrentlyCheckedOut:R,isDraft:Q,isIssue:F,repositoryDefaultBranch:le,events:me,owner:P,repo:Pe,busy:Ce,stateReason:xe}){const[je,Ie]=dt(d),[Le,Xe]=(0,l.useState)(!1),Ee=Ro(me);return l.createElement(l.Fragment,null,l.createElement(Vi,{title:je,titleHTML:p,number:y,url:C,inEditMode:Le,setEditMode:Xe,setCurrentTitle:Ie,canEdit:o,owner:P,repo:Pe}),l.createElement(is,{state:a,stateReason:xe,head:u,base:c,author:x,isIssue:F,isDraft:Q,codingAgentEvent:Ee}),l.createElement("div",{className:"header-actions"},l.createElement(Oo,{isCurrentlyCheckedOut:R,isIssue:F,repositoryDefaultBranch:le,owner:P,repo:Pe,number:y,busy:Ce}),l.createElement(Do,{canEdit:o,codingAgentEvent:Ee})))}i(Po,"Header");function Vi({title:o,titleHTML:a,number:u,url:c,inEditMode:d,setEditMode:p,setCurrentTitle:y,canEdit:C,owner:x,repo:R}){const{setTitle:Q,copyPrLink:F}=(0,l.useContext)(ke),le=l.createElement("form",{className:"editing-form title-editing-form",onSubmit:i(async Ce=>{Ce.preventDefault();try{const xe=Ce.target[0].value;await Q(xe),y(xe)}finally{p(!1)}},"onSubmit")},l.createElement("input",{type:"text",style:{width:"100%"},defaultValue:o}),l.createElement("div",{className:"form-actions"},l.createElement("button",{type:"button",className:"secondary",onClick:i(()=>p(!1),"onClick")},"Cancel"),l.createElement("button",{type:"submit"},"Update"))),me={preventDefaultContextMenuItems:!0,owner:x,repo:R,number:u};me["github:copyMenu"]=!0;const P=l.createElement("div",{className:"overview-title"},l.createElement("h2",null,l.createElement("span",{dangerouslySetInnerHTML:{__html:a}})," ",l.createElement("a",{href:c,title:c,"data-vscode-context":JSON.stringify(me)},"#",u)),C?l.createElement("button",{title:"Rename",onClick:i(()=>p(!0),"onClick"),className:"icon-button"},At):null,l.createElement("button",{title:"Copy Link",onClick:F,className:"icon-button","aria-label":"Copy Pull Request Link"},so));return d?le:P}i(Vi,"Title");function Oo({isCurrentlyCheckedOut:o,isIssue:a,repositoryDefaultBranch:u,owner:c,repo:d,number:p,busy:y}){const{refresh:C}=(0,l.useContext)(ke);return l.createElement("div",{className:"button-group"},l.createElement(_n,{isCurrentlyCheckedOut:o,isIssue:a,repositoryDefaultBranch:u,owner:c,repo:d,number:p}),l.createElement("button",{title:"Refresh with the latest data from GitHub",onClick:C,className:"secondary"},"Refresh"),y?l.createElement("div",{className:"spinner"},nn):null)}i(Oo,"ButtonGroup");function Do({canEdit:o,codingAgentEvent:a}){const{cancelCodingAgent:u,updatePR:c,openSessionLog:d}=(0,l.useContext)(ke),[p,y]=(0,l.useState)(!1),C=i(async()=>{if(!a)return;y(!0);const F=await u(a);F.events.length>0&&c(F),y(!1)},"cancel"),x=a==null?void 0:a.sessionLink;if(!a||nr(a)!==dn.Started)return null;const R={preventDefaultContextMenuItems:!0,...x};R["github:codingAgentMenu"]=!0;const Q=[];return x&&Q.push({label:"View Session",value:"",action:i(()=>d(x),"action")}),o&&Q.unshift({label:"Cancel Coding Agent",value:"",action:C}),l.createElement(Zn,{optionsContext:i(()=>JSON.stringify(R),"optionsContext"),defaultAction:Q[0].action,defaultOptionLabel:i(()=>p?l.createElement(l.Fragment,null,l.createElement("span",{className:"loading-button"},nn),Q[0].label):Q[0].label,"defaultOptionLabel"),defaultOptionValue:i(()=>Q[0].value,"defaultOptionValue"),allOptions:i(()=>Q,"allOptions"),optionsTitle:Q[0].label,disabled:p,hasSingleAction:!1,spreadable:!1,isSecondary:!0})}i(Do,"CancelCodingAgentButton");function is({state:o,stateReason:a,isDraft:u,isIssue:c,author:d,base:p,head:y,codingAgentEvent:C}){const{text:x,color:R,icon:Q}=$i(o,!!u,c,a),F=nr(C);let le;return F===dn.Started?le=Mr:F===dn.Completed?le=xi:F===dn.Failed&&(le=qn),l.createElement("div",{className:"subtitle"},l.createElement("div",{id:"status",className:`status-badge-${R}`},l.createElement("span",{className:"icon"},Q),l.createElement("span",null,x)),l.createElement("div",{className:"author"},l.createElement(st,{for:d,substituteIcon:le}),l.createElement("div",{className:"merge-branches"},l.createElement(ht,{for:d})," ",c?null:l.createElement(l.Fragment,null,Ao(o)," into"," ",l.createElement("code",{className:"branch-tag"},p)," from ",l.createElement("code",{className:"branch-tag"},y)))))}i(is,"Subtitle");const _n=i(({isCurrentlyCheckedOut:o,isIssue:a,repositoryDefaultBranch:u,owner:c,repo:d,number:p})=>{const{exitReviewMode:y,checkout:C,openChanges:x}=(0,l.useContext)(ke),[R,Q]=(0,l.useState)(!1),F=i(async P=>{try{switch(Q(!0),P){case"checkout":await C();break;case"exitReviewMode":await y();break;case"openChanges":await x();break;default:throw new Error(`Can't find action ${P}`)}}finally{Q(!1)}},"onClick");if(a)return null;const le={preventDefaultContextMenuItems:!0,owner:c,repo:d,number:p};le["github:checkoutMenu"]=!0;const me=[];return o?me.push({label:`Checkout '${u}'`,value:"",action:i(()=>F("exitReviewMode"),"action")}):me.push({label:"Checkout",value:"",action:i(()=>F("checkout"),"action")}),me.push({label:"Open Changes",value:"",action:i(()=>F("openChanges"),"action")}),l.createElement(Zn,{optionsContext:i(()=>JSON.stringify(le),"optionsContext"),defaultAction:me[0].action,defaultOptionLabel:i(()=>me[0].label,"defaultOptionLabel"),defaultOptionValue:i(()=>me[0].value,"defaultOptionValue"),allOptions:i(()=>me,"allOptions"),optionsTitle:me[0].label,disabled:R,hasSingleAction:!1,spreadable:!1})},"CheckoutButton");function $i(o,a,u,c){const d=u?gi:ai,p=u?vi:Un;if(o===K.Merged)return{text:"Merged",color:"merged",icon:Tr};if(o===K.Open)return a?{text:"Draft",color:"draft",icon:zl}:{text:"Open",color:"open",icon:p};{let y="closed";return u&&(y=c!=="COMPLETED"?"draft":"merged"),{text:"Closed",color:y,icon:d}}}i($i,"getStatus");function Ao(o){return o===K.Merged?"merged changes":"wants to merge changes"}i(Ao,"getActionText");function jt(o){const{reviewer:a,state:u}=o.reviewState,{reRequestReview:c}=(0,l.useContext)(ke),d=o.event?_t(o.event):void 0;return l.createElement("div",{className:"section-item reviewer"},l.createElement("div",{className:"avatar-with-author"},l.createElement(st,{for:a}),l.createElement(ht,{for:a})),l.createElement("div",{className:"reviewer-icons"},u!=="REQUESTED"&&(Be(a)||a.accountType!==O.Bot)?l.createElement("button",{className:"icon-button",title:"Re-request review",onClick:i(()=>c(o.reviewState.reviewer.id),"onClick")},ci,"\uFE0F"):null,Dr[u],d?l.createElement("div",{role:"alert","aria-label":d}):null))}i(jt,"Reviewer");const Dr={REQUESTED:(0,l.cloneElement)(It,{className:"section-icon requested",title:"Awaiting requested review"}),COMMENTED:(0,l.cloneElement)(Vl,{className:"section-icon commented",Root:"div",title:"Left review comments"}),APPROVED:(0,l.cloneElement)(jn,{className:"section-icon approved",title:"Approved these changes"}),CHANGES_REQUESTED:(0,l.cloneElement)(co,{className:"section-icon changes",title:"Requested changes"})},rr=i(({busy:o,baseHasMergeQueue:a})=>o?l.createElement("label",{htmlFor:"automerge-checkbox",className:"automerge-checkbox-label"},"Setting..."):l.createElement("label",{htmlFor:"automerge-checkbox",className:"automerge-checkbox-label"},a?"Merge when ready":"Auto-merge"),"AutoMergeLabel"),or=i(({updateState:o,baseHasMergeQueue:a,allowAutoMerge:u,defaultMergeMethod:c,mergeMethodsAvailability:d,autoMerge:p,isDraft:y})=>{if(!u&&!p||!d||!c)return null;const C=l.useRef(),[x,R]=l.useState(!1),Q=i(()=>{var F,le;return(le=(F=C.current)==null?void 0:F.value)!=null?le:"merge"},"selectedMethod");return l.createElement("div",{className:"automerge-section"},l.createElement("div",{className:"automerge-checkbox-wrapper"},l.createElement("input",{id:"automerge-checkbox",type:"checkbox",name:"automerge",checked:p,disabled:!u||y||x,onChange:i(async()=>{R(!0),await o({autoMerge:!p,autoMergeMethod:Q()}),R(!1)},"onChange")})),l.createElement(rr,{busy:x,baseHasMergeQueue:a}),a?null:l.createElement("div",{className:"merge-select-container"},l.createElement(Yi,{ref:C,defaultMergeMethod:c,mergeMethodsAvailability:d,onChange:i(async()=>{R(!0),await o({autoMergeMethod:Q()}),R(!1)},"onChange"),disabled:x})))},"AutoMerge"),ir=i(({mergeQueueEntry:o})=>{const a=l.useContext(ke);let u,c;switch(o.state){case w.Mergeable:case w.AwaitingChecks:case w.Queued:{c=l.createElement("span",{className:"merge-queue-pending"},"Queued to merge..."),o.position===1?u=l.createElement("span",null,"This pull request is at the head of the ",l.createElement("a",{href:o.url},"merge queue"),"."):u=l.createElement("span",null,"This pull request is in the ",l.createElement("a",{href:o.url},"merge queue"),".");break}case w.Locked:{c=l.createElement("span",{className:"merge-queue-blocked"},"Merging is blocked"),u=l.createElement("span",null,"The base branch does not allow updates");break}case w.Unmergeable:{c=l.createElement("span",{className:"merge-queue-blocked"},"Merging is blocked"),u=l.createElement("span",null,"There are conflicts with the base branch.");break}}return l.createElement("div",{className:"merge-queue-container"},l.createElement("div",{className:"merge-queue"},l.createElement("div",{className:"merge-queue-icon"}),l.createElement("div",{className:"merge-queue-title"},c),u),l.createElement("div",{className:"button-container"},l.createElement("button",{onClick:a.dequeue},"Remove from Queue")))},"QueuedToMerge");var Vt,Io=new Uint8Array(16);function Ut(){if(!Vt&&(Vt=typeof crypto!="undefined"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||typeof msCrypto!="undefined"&&typeof msCrypto.getRandomValues=="function"&&msCrypto.getRandomValues.bind(msCrypto),!Vt))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return Vt(Io)}i(Ut,"rng");const zi=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;function Bi(o){return typeof o=="string"&&zi.test(o)}i(Bi,"validate");const ls=Bi;for(var ot=[],Ho=0;Ho<256;++Ho)ot.push((Ho+256).toString(16).substr(1));function Ln(o){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:0,u=(ot[o[a+0]]+ot[o[a+1]]+ot[o[a+2]]+ot[o[a+3]]+"-"+ot[o[a+4]]+ot[o[a+5]]+"-"+ot[o[a+6]]+ot[o[a+7]]+"-"+ot[o[a+8]]+ot[o[a+9]]+"-"+ot[o[a+10]]+ot[o[a+11]]+ot[o[a+12]]+ot[o[a+13]]+ot[o[a+14]]+ot[o[a+15]]).toLowerCase();if(!ls(u))throw TypeError("Stringified UUID is invalid");return u}i(Ln,"stringify");const Kt=Ln;function Fo(o,a,u){o=o||{};var c=o.random||(o.rng||Ut)();if(c[6]=c[6]&15|64,c[8]=c[8]&63|128,a){u=u||0;for(var d=0;d<16;++d)a[u+d]=c[d];return a}return Kt(c)}i(Fo,"v4");const Ar=Fo;var ji=(o=>(o[o.esc=27]="esc",o[o.down=40]="down",o[o.up=38]="up",o))(ji||{});const Ir=i(({options:o,defaultOption:a,disabled:u,submitAction:c,changeAction:d})=>{const[p,y]=(0,l.useState)(a),[C,x]=(0,l.useState)(!1),R=Ar(),Q=`expandOptions${R}`,F=i(()=>{x(!C)},"onClick"),le=i(Pe=>{y(Pe.target.value),x(!1);const Ce=document.getElementById(`confirm-button${R}`);Ce==null||Ce.focus(),d&&d(Pe.target.value)},"onMethodChange"),me=i(Pe=>{if(C){const Ce=document.activeElement;switch(Pe.keyCode){case 27:x(!1);const xe=document.getElementById(Q);xe==null||xe.focus();break;case 40:if(!(Ce!=null&&Ce.id)||Ce.id===Q){const je=document.getElementById(`${R}option0`);je==null||je.focus()}else{const je=new RegExp(`${R}option([0-9])`),Ie=Ce.id.match(je);if(Ie!=null&&Ie.length){const Le=parseInt(Ie[1]);if(Le<Object.entries(o).length-1){const Xe=document.getElementById(`${R}option${Le+1}`);Xe==null||Xe.focus()}}}break;case 38:if(!(Ce!=null&&Ce.id)||Ce.id===Q){const je=Object.entries(o).length-1,Ie=document.getElementById(`${R}option${je}`);Ie==null||Ie.focus()}else{const je=new RegExp(`${R}option([0-9])`),Ie=Ce.id.match(je);if(Ie!=null&&Ie.length){const Le=parseInt(Ie[1]);if(Le>0){const Xe=document.getElementById(`${R}option${Le-1}`);Xe==null||Xe.focus()}}}break}}},"onKeyDown"),P=Object.entries(o).length===1?"hidden":C?"open":"";return l.createElement("div",{className:"select-container",onKeyDown:me},l.createElement("div",{className:"select-control"},l.createElement(Hr,{dropdownId:R,className:Object.keys(o).length>1?"select-left":"",options:o,selected:p,submitAction:c,disabled:!!u}),l.createElement("div",{className:`split${u?" disabled":""}`},l.createElement("div",{className:`separator${u?" disabled":""}`})),l.createElement("button",{id:Q,className:"select-right "+P,"aria-label":"Expand button options",onClick:F},li)),l.createElement("div",{className:C?"options-select":"hidden"},Object.entries(o).map(([Pe,Ce],xe)=>l.createElement("button",{id:`${R}option${xe}`,key:Pe,value:Pe,onClick:le},Ce))))},"Dropdown");function Hr({dropdownId:o,className:a,options:u,selected:c,disabled:d,submitAction:p}){const[y,C]=(0,l.useState)(!1),x=i(async R=>{R.preventDefault();try{C(!0),await p(c)}finally{C(!1)}},"onSubmit");return l.createElement("form",{onSubmit:x},l.createElement("input",{disabled:y||d,type:"submit",className:a,id:`confirm-button${o}`,value:u[c]}))}i(Hr,"Confirm");const kt=i(({pr:o,isSimple:a})=>o.state===K.Merged?l.createElement("div",{className:"branch-status-message"},l.createElement("div",{className:"branch-status-icon"},a?Tr:null)," ","Pull request successfully merged."):o.state===K.Closed?l.createElement("div",{className:"branch-status-message"},"This pull request is closed."):null,"PRStatusMessage"),ss=i(({pr:o})=>o.state===K.Open?null:l.createElement(Ki,{...o}),"DeleteOption"),as=i(({pr:o})=>{var a;const{state:u,status:c}=o,[d,p]=(0,l.useReducer)(y=>!y,(a=c==null?void 0:c.statuses.some(y=>y.state===ye.Failure))!=null?a:!1);return(0,l.useEffect)(()=>{var y;(y=c==null?void 0:c.statuses.some(C=>C.state===ye.Failure))!=null&&y?d||p():d&&p()},c==null?void 0:c.statuses),u===K.Open&&(c!=null&&c.statuses.length)?l.createElement(l.Fragment,null,l.createElement("div",{className:"status-section"},l.createElement("div",{className:"status-item"},l.createElement(Vo,{state:c.state}),l.createElement("p",{className:"status-item-detail-text"},Xi(c.statuses)),l.createElement("button",{id:"status-checks-display-button",className:"secondary small-button",onClick:p,"aria-expanded":d},d?"Hide":"Show")),d?l.createElement(Gi,{statuses:c.statuses}):null)):null},"StatusChecks"),Ui=i(({pr:o})=>{const{state:a,reviewRequirement:u}=o;return!u||a!==K.Open?null:l.createElement(l.Fragment,null,l.createElement("div",{className:"status-section"},l.createElement("div",{className:"status-item"},l.createElement(sr,{state:u.state}),l.createElement("p",{className:"status-item-detail-text"},ar(u)))))},"RequiredReviewers"),us=i(({pr:o,isSimple:a})=>{if(!a||o.state!==K.Open||o.reviewers.length===0)return null;const u=[],c=new Set(o.reviewers);let d=o.events.length-1;for(;d>=0&&c.size>0;){const p=o.events[d];if(p.event===Z.Reviewed){for(const y of c)if(p.user.id===y.reviewer.id){u.push({event:p,reviewState:y}),c.delete(y);break}}d--}return l.createElement("div",{className:"section"}," ",u.map(p=>l.createElement(jt,{key:Te(p.reviewState.reviewer),...p})))},"InlineReviewers"),cs=i(({pr:o,isSimple:a})=>o.isIssue?null:l.createElement("div",{id:"status-checks"},l.createElement(l.Fragment,null,l.createElement(kt,{pr:o,isSimple:a}),l.createElement(Ui,{pr:o}),l.createElement(as,{pr:o}),l.createElement(us,{pr:o,isSimple:a}),l.createElement(ds,{pr:o,isSimple:a}),l.createElement(ss,{pr:o}))),"StatusChecksSection"),ds=i(({pr:o,isSimple:a})=>{const{create:u,checkMergeability:c}=(0,l.useContext)(ke);if(a&&o.state!==K.Open)return l.createElement("div",{className:"branch-status-container"},l.createElement("form",null,l.createElement("button",{type:"submit",onClick:u},"Create New Pull Request...")));if(o.state!==K.Open)return null;const{mergeable:d}=o,[p,y]=(0,l.useState)(d);return d!==p&&d!==ce.Unknown&&y(d),(0,l.useEffect)(()=>{const C=setInterval(async()=>{if(p===ce.Unknown){const x=await c();y(x)}},3e3);return()=>clearInterval(C)},[p]),l.createElement("div",null,l.createElement(lr,{mergeable:p,isSimple:a,canUpdateBranch:o.canUpdateBranch}),l.createElement(fs,{mergeable:p,isSimple:a,isCurrentlyCheckedOut:o.isCurrentlyCheckedOut,canUpdateBranch:o.canUpdateBranch}),l.createElement(Wt,{pr:{...o,mergeable:p},isSimple:a}))},"MergeStatusAndActions"),Wi=null,lr=i(({mergeable:o,isSimple:a,canUpdateBranch:u})=>{const{updateBranch:c}=(0,l.useContext)(ke),[d,p]=(0,l.useState)(!1),y=i(()=>{p(!0),c().finally(()=>p(!1))},"onClick");let C=It,x="Checking if this branch can be merged...",R=null;return o===ce.Mergeable?(C=jn,x="This branch has no conflicts with the base branch."):o===ce.Conflict?(C=St,x="This branch has conflicts that must be resolved.",R="Resolve conflicts"):o===ce.NotMergeable?(C=St,x="Branch protection policy must be fulfilled before merging."):o===ce.Behind&&(C=St,x="This branch is out-of-date with the base branch.",R="Update with merge commit"),a&&(C=null,o!==ce.Conflict&&(R=null)),l.createElement("div",{className:"status-item status-section"},C,l.createElement("p",null,x),R&&u?l.createElement("div",{className:"button-container"},l.createElement("button",{className:"secondary",onClick:y,disabled:d},R)):null)},"MergeStatus"),fs=i(({mergeable:o,isSimple:a,isCurrentlyCheckedOut:u,canUpdateBranch:c})=>{const{updateBranch:d}=(0,l.useContext)(ke),[p,y]=(0,l.useState)(!1),C=i(()=>{y(!0),d().finally(()=>y(!1))},"update"),x=!u&&o===ce.Conflict;return!c||x||a||o===ce.Behind||o===ce.Conflict||o===ce.Unknown?null:l.createElement("div",{className:"status-item status-section"},Qt,l.createElement("p",null,"This branch is out-of-date with the base branch."),l.createElement("button",{className:"secondary",onClick:C,disabled:p},"Update with Merge Commit"))},"OfferToUpdate"),qi=i(({isSimple:o})=>{const[a,u]=(0,l.useState)(!1),{readyForReview:c,updatePR:d}=(0,l.useContext)(ke),p=(0,l.useCallback)(async()=>{try{u(!0);const y=await c();d(y)}finally{u(!1)}},[u,c,d]);return l.createElement("div",{className:"ready-for-review-container"},l.createElement("div",{className:"ready-for-review-text-wrapper"},l.createElement("div",{className:"ready-for-review-icon"},o?null:Qt),l.createElement("div",null,l.createElement("div",{className:"ready-for-review-heading"},"This pull request is still a work in progress."),l.createElement("div",{className:"ready-for-review-meta"},"Draft pull requests cannot be merged."))),l.createElement("div",{className:"button-container"},l.createElement("button",{disabled:a,onClick:p},"Ready for Review")))},"ReadyForReview"),Zi=i(o=>{const a=(0,l.useContext)(ke),u=(0,l.useRef)(),[c,d]=(0,l.useState)(null);return o.mergeQueueMethod?l.createElement("div",null,l.createElement("div",{id:"merge-comment-form"},l.createElement("button",{onClick:i(()=>a.enqueue(),"onClick")},"Add to Merge Queue"))):c?l.createElement(Sn,{pr:o,method:c,cancel:i(()=>d(null),"cancel")}):l.createElement("div",{className:"automerge-section wrapper"},l.createElement("button",{onClick:i(()=>d(u.current.value),"onClick")},"Merge Pull Request"),lt,"using method",lt,l.createElement(Yi,{ref:u,...o}))},"Merge"),Wt=i(({pr:o,isSimple:a})=>{var u;const{hasWritePermission:c,canEdit:d,isDraft:p,mergeable:y}=o;if(p)return d?l.createElement(qi,{isSimple:a}):null;if(y===ce.Mergeable&&c&&!o.mergeQueueEntry)return a?l.createElement(Qi,{...o}):l.createElement(Zi,{...o});if(!a&&c&&!o.mergeQueueEntry){const C=(0,l.useContext)(ke);return l.createElement(or,{updateState:i(x=>C.updateAutoMerge(x),"updateState"),...o,baseHasMergeQueue:!!o.mergeQueueMethod,defaultMergeMethod:(u=o.autoMergeMethod)!=null?u:o.defaultMergeMethod})}else if(o.mergeQueueEntry)return l.createElement(ir,{mergeQueueEntry:o.mergeQueueEntry});return null},"PrActions"),ms=i(()=>{const{openOnGitHub:o}=useContext(PullRequestContext);return React.createElement("button",{id:"merge-on-github",type:"submit",onClick:i(()=>o(),"onClick")},"Merge on github.com")},"MergeOnGitHub"),Qi=i(o=>{const{merge:a,updatePR:u}=(0,l.useContext)(ke);async function c(p){const y=await a({title:"",description:"",method:p});u(y)}i(c,"submitAction");const d=Object.keys(Fr).filter(p=>o.mergeMethodsAvailability[p]).reduce((p,y)=>(p[y]=Fr[y],p),{});return l.createElement(Ir,{options:d,defaultOption:o.defaultMergeMethod,submitAction:c})},"MergeSimple"),Ki=i(o=>{const{deleteBranch:a}=(0,l.useContext)(ke),[u,c]=(0,l.useState)(!1);return o.isRemoteHeadDeleted!==!1&&o.isLocalHeadDeleted!==!1?l.createElement("div",null):l.createElement("div",{className:"branch-status-container"},l.createElement("form",{onSubmit:i(async d=>{d.preventDefault();try{c(!0);const p=await a();p&&p.cancelled&&c(!1)}finally{c(!1)}},"onSubmit")},l.createElement("button",{disabled:u,className:"secondary",type:"submit"},"Delete Branch...")))},"DeleteBranch");function Sn({pr:o,method:a,cancel:u}){const{merge:c,updatePR:d,changeEmail:p}=(0,l.useContext)(ke),[y,C]=(0,l.useState)(!1),x=o.emailForCommit;return l.createElement("div",null,l.createElement("form",{id:"merge-comment-form",onSubmit:i(async R=>{R.preventDefault();try{C(!0);const{title:Q,description:F}=R.target,le=await c({title:Q==null?void 0:Q.value,description:F==null?void 0:F.value,method:a,email:x});d(le)}finally{C(!1)}},"onSubmit")},a==="rebase"?null:l.createElement("input",{type:"text",name:"title",defaultValue:ps(a,o)}),a==="rebase"?null:l.createElement("textarea",{name:"description",defaultValue:hs(a,o)}),a==="rebase"||!x?null:l.createElement("div",{className:"commit-association"},l.createElement("span",null,"Commit will be associated with ",l.createElement("button",{className:"input-box",title:"Change email","aria-label":"Change email",disabled:y,onClick:i(()=>{C(!0),p(x).finally(()=>C(!1))},"onClick")},x))),l.createElement("div",{className:"form-actions",id:a==="rebase"?"rebase-actions":""},l.createElement("button",{className:"secondary",onClick:u},"Cancel"),l.createElement("button",{disabled:y,type:"submit",id:"confirm-merge"},a==="rebase"?"Confirm ":"",Fr[a]))))}i(Sn,"ConfirmMerge");function ps(o,a){var u,c,d,p;switch(o){case"merge":return(c=(u=a.mergeCommitMeta)==null?void 0:u.title)!=null?c:`Merge pull request #${a.number} from ${a.head}`;case"squash":return(p=(d=a.squashCommitMeta)==null?void 0:d.title)!=null?p:`${a.title} (#${a.number})`;default:return""}}i(ps,"getDefaultTitleText");function hs(o,a){var u,c,d,p;switch(o){case"merge":return(c=(u=a.mergeCommitMeta)==null?void 0:u.description)!=null?c:a.title;case"squash":return(p=(d=a.squashCommitMeta)==null?void 0:d.description)!=null?p:"";default:return""}}i(hs,"getDefaultDescriptionText");const Fr={merge:"Create Merge Commit",squash:"Squash and Merge",rebase:"Rebase and Merge"},Yi=l.forwardRef(({defaultMergeMethod:o,mergeMethodsAvailability:a,onChange:u,ariaLabel:c,name:d,title:p,disabled:y},C)=>l.createElement("select",{ref:C,defaultValue:o,onChange:u,disabled:y,"aria-label":c!=null?c:"Select merge method",name:d,title:p},Object.entries(Fr).map(([x,R])=>l.createElement("option",{key:x,value:x,disabled:!a[x]},R,a[x]?null:" (not enabled)")))),Gi=i(({statuses:o})=>l.createElement("div",{className:"status-scroll"},o.map(a=>l.createElement("div",{key:a.id,className:"status-check"},l.createElement("div",{className:"status-check-details"},l.createElement(Vo,{state:a.state}),l.createElement(st,{for:{avatarUrl:a.avatarUrl,url:a.url}}),l.createElement("span",{className:"status-check-detail-text"},a.workflowName?`${a.workflowName} / `:null,a.context,a.event?` (${a.event})`:null," ",a.description?`\u2014 ${a.description}`:null)),l.createElement("div",null,a.isRequired?l.createElement("span",{className:"label"},"Required"):null,a.targetUrl?l.createElement("a",{href:a.targetUrl,title:a.targetUrl},"Details"):null)))),"StatusCheckDetails");function Xi(o){const a=vo(o,c=>{switch(c.state){case ye.Success:case ye.Failure:case ye.Neutral:return c.state;default:return ye.Pending}}),u=[];for(const c of Object.keys(a)){const d=a[c].length;let p="";switch(c){case ye.Success:p="successful";break;case ye.Failure:p="failed";break;case ye.Neutral:p="skipped";break;default:p="pending"}const y=d>1?`${d} ${p} checks`:`${d} ${p} check`;u.push(y)}return u.join(" and ")}i(Xi,"getSummaryLabel");function Vo({state:o}){switch(o){case ye.Neutral:return Lr;case ye.Success:return jn;case ye.Failure:return St}return It}i(Vo,"StateIcon");function sr({state:o}){switch(o){case ye.Pending:return co;case ye.Failure:return St}return jn}i(sr,"RequiredReviewStateIcon");function ar(o){const a=o.approvals.length,u=o.requestedChanges.length,c=o.count;switch(o.state){case ye.Failure:return`At least ${c} approving review${c>1?"s":""} is required by reviewers with write access.`;case ye.Pending:return`${u} review${u>1?"s":""} requesting changes by reviewers with write access.`}return`${a} approving review${a>1?"s":""} by reviewers with write access.`}i(ar,"getRequiredReviewSummary");function vs(o){const{displayName:a,canDelete:u,color:c}=o,d=Ht(c,o.isDarkTheme,!1);return l.createElement("div",{className:"section-item label",style:{backgroundColor:d.backgroundColor,color:d.textColor,borderColor:`${d.borderColor}`,paddingRight:u?"2px":"8px"}},a,o.children)}i(vs,"Label");function $o(o){const{displayName:a,color:u}=o,c=gitHubLabelColor(u,o.isDarkTheme,!1);return React.createElement("li",{style:{backgroundColor:c.backgroundColor,color:c.textColor,borderColor:`${c.borderColor}`}},a,o.children)}i($o,"LabelCreate");function ur({id:o,title:a,hasWritePermission:u,onHeaderClick:c,children:d,iconButtonGroup:p}){return l.createElement("div",{id:o,className:"section"},l.createElement("div",{className:`section-header ${u?"clickable":""}`,onClick:u?c:void 0},l.createElement("div",{className:"section-title"},a),u?p||l.createElement("button",{className:"icon-button",title:`Add ${a}`,onClick:c},ui):null),d)}i(ur,"Section");function Vr({reviewers:o,labels:a,hasWritePermission:u,isIssue:c,projectItems:d,milestone:p,assignees:y,canAssignCopilot:C}){const{addReviewers:x,addAssignees:R,addAssigneeYourself:Q,addAssigneeCopilot:F,addLabels:le,removeLabel:me,changeProjects:P,addMilestone:Pe,updatePR:Ce,pr:xe}=(0,l.useContext)(ke),[je,Ie]=(0,l.useState)(!1),Le=C&&y.every(Ee=>!Fi.includes(Ee.login)),Xe=i(async()=>{const Ee=await P();Ce({...Ee})},"updateProjects");return l.createElement("div",{id:"sidebar"},!c&&l.createElement(ur,{id:"reviewers",title:"Reviewers",hasWritePermission:u,onHeaderClick:i(async()=>{const Ee=await x();Ce({reviewers:Ee.reviewers})},"onHeaderClick")},o&&o.length?o.map(Ee=>l.createElement(jt,{key:Te(Ee.reviewer),reviewState:Ee})):l.createElement("div",{className:"section-placeholder"},"None yet")),l.createElement(ur,{id:"assignees",title:"Assignees",hasWritePermission:u,onHeaderClick:i(async Ee=>{const qe=Ee==null?void 0:Ee.target;if(qe!=null&&qe.closest&&qe.closest("#assign-copilot-btn"))return;const vt=await R();Ce({assignees:vt.assignees,events:vt.events})},"onHeaderClick"),iconButtonGroup:u&&l.createElement("div",{className:"icon-button-group"},Le?l.createElement("button",{id:"assign-copilot-btn",className:"icon-button",title:"Assign for Copilot to work on",disabled:je,onClick:i(async Ee=>{Ee.stopPropagation(),Ie(!0);try{const qe=await F();Ce({assignees:qe.assignees,events:qe.events})}finally{Ie(!1)}},"onClick")},yi):null,l.createElement("button",{className:"icon-button",title:"Add Assignees"},ui))},y&&y.length?y.map((Ee,qe)=>l.createElement("div",{key:qe,className:"section-item reviewer"},l.createElement("div",{className:"avatar-with-author"},l.createElement(st,{for:Ee}),l.createElement(ht,{for:Ee})))):l.createElement("div",{className:"section-placeholder"},"None yet",xe.hasWritePermission?l.createElement(l.Fragment,null,"\u2014",l.createElement("a",{className:"assign-yourself",onClick:i(async()=>{const Ee=await Q();Ce({assignees:Ee.assignees,events:Ee.events})},"onClick")},"assign yourself")):null)),l.createElement(ur,{id:"labels",title:"Labels",hasWritePermission:u,onHeaderClick:i(async()=>{const Ee=await le();Ce({labels:Ee.added})},"onHeaderClick")},a.length?l.createElement("div",{className:"labels-list"},a.map(Ee=>l.createElement(vs,{key:Ee.name,...Ee,canDelete:u,isDarkTheme:xe.isDarkTheme},u?l.createElement("button",{className:"icon-button",onClick:i(()=>me(Ee.name),"onClick")},St,"\uFE0F"):null))):l.createElement("div",{className:"section-placeholder"},"None yet")),!xe.isEnterprise&&l.createElement(ur,{id:"project",title:"Project",hasWritePermission:u,onHeaderClick:Xe},d?d.length>0?d.map(Ee=>l.createElement(ys,{key:Ee.project.title,...Ee,canDelete:u})):l.createElement("div",{className:"section-placeholder"},"None yet"):l.createElement("a",{onClick:Xe},"Sign in with more permissions to see projects")),l.createElement(ur,{id:"milestone",title:"Milestone",hasWritePermission:u,onHeaderClick:i(async()=>{const Ee=await Pe();Ce({milestone:Ee.added})},"onHeaderClick")},p?l.createElement(gs,{key:p.title,...p,canDelete:u}):l.createElement("div",{className:"section-placeholder"},"No milestone")))}i(Vr,"Sidebar");function Ji(o){const[a,u]=(0,l.useState)(!1),c=(0,l.useRef)(null);return l.createElement("div",{className:"collapsible-sidebar"},l.createElement("div",{className:`collapsible-sidebar-header ${a?"expanded":""}`,onClick:i(()=>u(d=>!d),"onClick"),tabIndex:0,role:"button","aria-expanded":a},l.createElement("span",{className:"collapsible-sidebar-title"},a?null:l.createElement(el,{...o}))),l.createElement("div",{className:"collapsible-sidebar-content",ref:c,style:{display:a?"block":"none"}},l.createElement(Vr,{...o})),l.createElement("a",{className:"collapsible-label-see-more",onClick:i(()=>u(d=>!d),"onClick")},a?"See less":"See more"))}i(Ji,"CollapsibleSidebar");function el(o){const{reviewers:a,assignees:u,labels:c,projectItems:d,milestone:p,isIssue:y}=o,[C,x]=(0,l.useState)(!1);(0,l.useEffect)(()=>{const P=i(()=>{x(window.innerWidth<=350)},"checkViewportWidth");return P(),window.addEventListener("resize",P),()=>window.removeEventListener("resize",P)},[]);const R=i(({users:P})=>l.createElement("span",{className:"avatar-stack",style:{width:`${Math.min(P.length,10)*10+10}px`}},P.slice(0,10).map((Pe,Ce)=>l.createElement("span",{className:"stacked-avatar",style:{left:`${Ce*10}px`}},l.createElement(st,{for:Pe})))),"AvatarStack"),Q=i(({items:P,getKey:Pe,getColor:Ce,getText:xe})=>{const je=(0,l.useRef)(null),[Ie,Le]=(0,l.useState)(P.length);(0,l.useEffect)(()=>{if(!je.current||P.length===0)return;const qe=new ResizeObserver(()=>{const vt=je.current;if(!vt)return;const Nt=vt.offsetWidth,Ze=60;let it=P.length,An=P.reduce((Qe,at)=>Qe+xe(at).length,0);for(;it>0&&!(An*6+14*it+(it<P.length?Ze:0)<=Nt);)An-=xe(P[it-1]).length,it--;Le(Math.max(1,it))});return qe.observe(je.current),()=>qe.disconnect()},[P.length]);const Xe=P.slice(0,Ie),Ee=P.length-Ie;return l.createElement("span",{className:"pill-container",ref:je},Xe.map(qe=>{const vt=Ce(qe);return l.createElement("span",{key:Pe(qe),className:"pill-item label",style:{backgroundColor:vt.backgroundColor,color:vt.textColor,borderRadius:"20px"},title:xe(qe)},xe(qe))}),Ee>0&&l.createElement("span",{className:"pill-overflow"},"+",Ee," more"))},"PillContainer"),F=[],le=a==null?void 0:a.filter(P=>!!P.reviewer.avatarUrl).map(P=>({avatarUrl:P.reviewer.avatarUrl,name:_e(P.reviewer)}));!y&&le&&le.length&&F.push({label:"Reviewers",value:l.createElement(R,{users:le}),count:le.length});const me=u==null?void 0:u.filter(P=>!!P.avatarUrl).map(P=>({avatarUrl:P.avatarUrl,name:_e(P)}));return me&&me.length&&F.push({label:"Assignees",value:l.createElement(R,{users:me}),count:me.length}),c&&c.length&&F.push({label:"Labels",value:l.createElement(Q,{items:c,getKey:i(P=>P.name,"getKey"),getColor:i(P=>Ht(P.color,o==null?void 0:o.isDarkTheme,!1),"getColor"),getText:i(P=>P.name,"getText")}),count:c.length}),d&&d.length&&F.push({label:"Project",value:l.createElement(Q,{items:d,getKey:i(P=>P.project.title,"getKey"),getColor:i(()=>Ht("#ededed",o==null?void 0:o.isDarkTheme,!1),"getColor"),getText:i(P=>P.project.title,"getText")}),count:d.length}),p&&F.push({label:"Milestone",value:l.createElement(Q,{items:[p],getKey:i(P=>P.title,"getKey"),getColor:i(()=>Ht("#ededed",o==null?void 0:o.isDarkTheme,!1),"getColor"),getText:i(P=>P.title,"getText")}),count:1}),F.length?l.createElement("span",{className:"collapsed-label"},F.map(P=>l.createElement("span",{className:"collapsed-section",key:P.label},l.createElement("span",{className:"collapsed-section-label"},P.label),C?l.createElement("span",{className:"collapsed-section-count"},P.count):P.value))):l.createElement("span",{className:"collapsed-label"},y?"Assignees, Labels, Project, and Milestone":"Reviewers, Assignees, Labels, Project, and Milestone")}i(el,"CollapsedLabel");function gs(o){const{removeMilestone:a,updatePR:u,pr:c}=(0,l.useContext)(ke),d=getComputedStyle(document.documentElement).getPropertyValue("--vscode-badge-foreground"),p=Ht(d,c.isDarkTheme,!1),{canDelete:y,title:C}=o;return l.createElement("div",{className:"labels-list"},l.createElement("div",{className:"section-item label",style:{backgroundColor:p.backgroundColor,color:p.textColor,borderColor:`${p.borderColor}`}},C,y?l.createElement("button",{className:"icon-button",onClick:i(async()=>{await a(),u({milestone:void 0})},"onClick")},St,"\uFE0F"):null))}i(gs,"Milestone");function ys(o){const{removeProject:a,updatePR:u,pr:c}=(0,l.useContext)(ke),d=getComputedStyle(document.documentElement).getPropertyValue("--vscode-badge-foreground"),p=Ht(d,c.isDarkTheme,!1),{canDelete:y}=o;return l.createElement("div",{className:"labels-list"},l.createElement("div",{className:"section-item label",style:{backgroundColor:p.backgroundColor,color:p.textColor,borderColor:`${p.borderColor}`}},o.project.title,y?l.createElement("button",{className:"icon-button",onClick:i(async()=>{var C;await a(o),u({projectItems:(C=c.projectItems)==null?void 0:C.filter(x=>x.id!==o.id)})},"onClick")},St,"\uFE0F"):null))}i(ys,"Project");var Cs=(o=>(o[o.ADD=0]="ADD",o[o.COPY=1]="COPY",o[o.DELETE=2]="DELETE",o[o.MODIFY=3]="MODIFY",o[o.RENAME=4]="RENAME",o[o.TYPE=5]="TYPE",o[o.UNKNOWN=6]="UNKNOWN",o[o.UNMERGED=7]="UNMERGED",o))(Cs||{});const Dn=class Dn{constructor(a,u,c,d,p,y,C){this.baseCommit=a,this.status=u,this.fileName=c,this.previousFileName=d,this.patch=p,this.diffHunks=y,this.blobUrl=C}};i(Dn,"file_InMemFileChange");let tl=Dn;const Yr=class Yr{constructor(a,u,c,d,p){this.baseCommit=a,this.blobUrl=u,this.status=c,this.fileName=d,this.previousFileName=p}};i(Yr,"file_SlimFileChange");let nl=Yr;var cr=Object.defineProperty,ws=i((o,a,u)=>a in o?cr(o,a,{enumerable:!0,configurable:!0,writable:!0,value:u}):o[a]=u,"diffHunk_defNormalProp"),xs=i((o,a,u)=>ws(o,typeof a!="symbol"?a+"":a,u),"diffHunk_publicField"),$r=(o=>(o[o.Context=0]="Context",o[o.Add=1]="Add",o[o.Delete=2]="Delete",o[o.Control=3]="Control",o))($r||{});const Gr=class Gr{constructor(a,u,c,d,p,y=!0){this.type=a,this.oldLineNumber=u,this.newLineNumber=c,this.positionInHunk=d,this._raw=p,this.endwithLineBreak=y}get raw(){return this._raw}get text(){return this._raw.substr(1)}};i(Gr,"DiffLine");let dr=Gr;function rl(o){switch(o[0]){case" ":return 0;case"+":return 1;case"-":return 2;default:return 3}}i(rl,"getDiffChangeType");const Xr=class Xr{constructor(a,u,c,d,p){this.oldLineNumber=a,this.oldLength=u,this.newLineNumber=c,this.newLength=d,this.positionInHunk=p,xs(this,"diffLines",[])}};i(Xr,"DiffHunk");let zr=Xr;const zo=/^@@ \-(\d+)(,(\d+))?( \+(\d+)(,(\d+)?)?)? @@/;function fr(o){let a=0,u=0;for(;(u=o.indexOf("\r",u))!==-1;)u++,a++;return a}i(fr,"countCarriageReturns");function*ol(o){let a=0;for(;a!==-1&&a<o.length;){const u=a;a=o.indexOf(`
`,a);let d=(a!==-1?a:o.length)-u;a!==-1&&(a>0&&o[a-1]==="\r"&&d--,a++),yield o.substr(u,d)}}i(ol,"LineReader");function*Tn(o){const a=ol(o);let u=a.next(),c,d=-1,p=-1,y=-1;for(;!u.done;){const C=u.value;if(zo.test(C)){c&&(yield c,c=void 0),d===-1&&(d=0);const x=zo.exec(C),R=p=Number(x[1]),Q=Number(x[3])||1,F=y=Number(x[5]),le=Number(x[7])||1;c=new zr(R,Q,F,le,d),c.diffLines.push(new dr(3,-1,-1,d,C))}else if(c){const x=rl(C);if(x===3)c.diffLines&&c.diffLines.length&&(c.diffLines[c.diffLines.length-1].endwithLineBreak=!1);else{c.diffLines.push(new dr(x,x!==1?p:-1,x!==2?y:-1,d,C));const R=1+fr(C);switch(x){case 0:p+=R,y+=R;break;case 2:p+=R;break;case 1:y+=R;break}}}d!==-1&&++d,u=a.next()}c&&(yield c)}i(Tn,"parseDiffHunk");function Es(o){const a=Tn(o);let u=a.next();const c=[];for(;!u.done;){const d=u.value;c.push(d),u=a.next()}return c}i(Es,"parsePatch");function _a(o){const a=[],u=i(x=>({diffLines:[],newLength:0,oldLength:0,oldLineNumber:x.oldLineNumber,newLineNumber:x.newLineNumber,positionInHunk:0}),"newHunk");let c,d;const p=i((x,R)=>{x.diffLines.push(R),R.type===2?x.oldLength++:R.type===1?x.newLength++:R.type===0&&(x.oldLength++,x.newLength++)},"addLineToHunk"),y=i(x=>x.diffLines.some(R=>R.type!==0),"hunkHasChanges"),C=i(x=>y(x)&&x.diffLines[x.diffLines.length-1].type===0,"hunkHasSandwichedChanges");for(const x of o.diffLines)x.type===0?(c||(c=u(x)),p(c,x),C(c)&&(d||(d=u(x)),p(d,x))):(c||o.oldLineNumber===1&&(x.type===2||x.type===1))&&(c||(c=u(x)),C(c)&&(a.push(c),c=d,d=void 0),(x.type===2||x.type===1)&&p(c,x));return c&&a.push(c),a}i(_a,"splitIntoSmallerHunks");function Mn(o,a){const u=o.split(/\r?\n/),c=Tn(a);let d=c.next();const p=[],y=[];let C=0,x=!0;for(;!d.done;){const R=d.value;p.push(R);const Q=R.oldLineNumber;for(let F=C+1;F<Q;F++)y.push(u[F-1]);C=Q+R.oldLength-1;for(let F=0;F<R.diffLines.length;F++){const le=R.diffLines[F];if(!(le.type===2||le.type===3))if(le.type===1)y.push(le.text);else{const me=le.text;y.push(me)}}if(d=c.next(),d.done){for(let F=R.diffLines.length-1;F>=0;F--)if(R.diffLines[F].type!==2){x=R.diffLines[F].endwithLineBreak;break}}}if(x)if(C<u.length)for(let R=C+1;R<=u.length;R++)y.push(u[R-1]);else y.push("");return y.join(`
`)}i(Mn,"getModifiedContentFromDiffHunk");function bs(o){switch(o){case"removed":return GitChangeType.DELETE;case"added":return GitChangeType.ADD;case"renamed":return GitChangeType.RENAME;case"modified":return GitChangeType.MODIFY;default:return GitChangeType.UNKNOWN}}i(bs,"getGitChangeType");async function Br(o,a){var u;const c=[];for(let d=0;d<o.length;d++){const p=o[d],y=bs(p.status);if(!p.patch&&y!==GitChangeType.RENAME&&y!==GitChangeType.MODIFY&&!(y===GitChangeType.ADD&&p.additions===0)){c.push(new SlimFileChange(a,p.blob_url,y,p.filename,p.previous_filename));continue}const C=p.patch?Es(p.patch):void 0;c.push(new InMemFileChange(a,y,p.filename,p.previous_filename,(u=p.patch)!=null?u:"",C,p.blob_url))}return c}i(Br,"parseDiff");function ks({hunks:o}){return l.createElement("div",{className:"diff"},o.map((a,u)=>l.createElement(Nn,{key:u,hunk:a})))}i(ks,"Diff");const il=ks,Nn=i(({hunk:o,maxLines:a=8})=>l.createElement(l.Fragment,null,o.diffLines.slice(-a).map(u=>l.createElement("div",{key:Bo(u),className:`diffLine ${jo(u.type)}`},l.createElement(Rn,{num:u.oldLineNumber}),l.createElement(Rn,{num:u.newLineNumber}),l.createElement("div",{className:"diffTypeSign"},u._raw.substr(0,1)),l.createElement("div",{className:"lineContent"},u._raw.substr(1))))),"Hunk"),Bo=i(o=>`${o.oldLineNumber}->${o.newLineNumber}`,"keyForDiffLine"),Rn=i(({num:o})=>l.createElement("div",{className:"lineNumber"},o>0?o:" "),"LineNumber"),jo=i(o=>$r[o].toLowerCase(),"getDiffChangeClass");function Uo(o){return o.event===Z.Assigned||o.event===Z.Unassigned}i(Uo,"isAssignUnassignEvent");const _s=i(({events:o,isIssue:a})=>{var u,c,d,p;const y=[];for(let C=0;C<o.length;C++)if(C>0&&Uo(o[C])&&Uo(y[y.length-1])){const x=y[y.length-1],R=o[C];if(x.actor.login===R.actor.login&&new Date(x.createdAt).getTime()+1e3*60*10>new Date(R.createdAt).getTime()){const Q=x.assignees||[],F=x.unassignees||[],le=(c=(u=R.assignees)==null?void 0:u.filter(P=>!Q.some(Pe=>Pe.id===P.id)))!=null?c:[],me=(p=(d=R.unassignees)==null?void 0:d.filter(P=>!F.some(Pe=>Pe.id===P.id)))!=null?p:[];x.assignees=[...Q,...le],x.unassignees=[...F,...me]}else y.push(R)}else y.push(o[C]);return l.createElement(l.Fragment,null,y.map(C=>{switch(C.event){case Z.Committed:return l.createElement(Ls,{key:`commit${C.id}`,...C});case Z.Reviewed:return l.createElement(Ms,{key:`review${C.id}`,...C});case Z.Commented:return l.createElement(Ps,{key:`comment${C.id}`,...C});case Z.Merged:return l.createElement(Os,{key:`merged${C.id}`,...C});case Z.Assigned:return l.createElement(Ur,{key:`assign${C.id}`,event:C});case Z.Unassigned:return l.createElement(Ur,{key:`unassign${C.id}`,event:C});case Z.HeadRefDeleted:return l.createElement(Ds,{key:`head${C.id}`,...C});case Z.CrossReferenced:return l.createElement(As,{key:`cross${C.id}`,...C});case Z.Closed:return l.createElement(Pn,{key:`closed${C.id}`,event:C,isIssue:a});case Z.Reopened:return l.createElement(Ge,{key:`reopened${C.id}`,event:C,isIssue:a});case Z.NewCommitsSinceReview:return l.createElement(Ss,{key:`newCommits${C.id}`});case Z.CopilotStarted:return l.createElement(et,{key:`copilotStarted${C.id}`,...C});case Z.CopilotFinished:return l.createElement(Yt,{key:`copilotFinished${C.id}`,...C});case Z.CopilotFinishedError:return l.createElement(ft,{key:`copilotFinishedError${C.id}`,...C});default:throw new Yn(C)}}))},"Timeline"),La=null,Ls=i(o=>{var a;const u=(0,l.useContext)(ke),[c,d]=(0,l.useState)(void 0),p=i((C,x)=>{C.preventDefault(),d(x),u.openCommitChanges(o.sha).finally(()=>{d(void 0)})},"handleCommitClick"),y=((a=u.pr)==null?void 0:a.loadingCommit)===o.sha;return l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},Sr,lt,l.createElement("div",{className:"avatar-container"},l.createElement(st,{for:o.author})),l.createElement("div",{className:"message-container"},l.createElement("a",{className:"message",onClick:i(C=>p(C,"title"),"onClick"),title:o.htmlUrl},o.message.substr(0,o.message.indexOf(`
`)>-1?o.message.indexOf(`
`):o.message.length)),y&&c==="title"&&l.createElement("span",{className:"commit-spinner-inline"},nn))),l.createElement("div",{className:"timeline-detail"},l.createElement("a",{className:"sha",onClick:i(C=>p(C,"sha"),"onClick"),title:o.htmlUrl},y&&c==="sha"&&l.createElement("span",{className:"commit-spinner-before"},nn),o.sha.slice(0,7)),l.createElement(Mt,{date:o.committedDate})))},"CommitEventView"),Ss=i(()=>{const{gotoChangesSinceReview:o,pr:a}=(0,l.useContext)(ke);if(!a.isCurrentlyCheckedOut)return null;const[u,c]=(0,l.useState)(!1),d=i(async()=>{c(!0),await o(),c(!1)},"viewChanges");return l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},uo,lt,l.createElement("span",{style:{fontWeight:"bold"}},"New changes since your last Review")),l.createElement("button",{"aria-live":"polite",title:"View the changes since your last review",onClick:d,disabled:u},"View Changes"))},"NewCommitsSinceReviewEventView"),jr=i(o=>o.position!==null?`pos:${o.position}`:`ori:${o.originalPosition}`,"positionKey"),Ts=i(o=>vo(o,a=>a.path+":"+jr(a)),"groupCommentsByPath"),Ms=i(o=>{const a=Ts(o.comments),u=o.state==="PENDING";return l.createElement(cn,{comment:o,allowEmpty:!0},o.comments.length?l.createElement("div",{className:"comment-body review-comment-body"},Object.entries(a).map(([c,d])=>l.createElement(Ns,{key:c,thread:d,event:o}))):null,u?l.createElement(Rs,null):null)},"ReviewEventView");function Ns({thread:o,event:a}){var u;const c=o[0],[d,p]=(0,l.useState)(!c.isResolved),[y,C]=(0,l.useState)(!!c.isResolved),{openDiff:x,toggleResolveComment:R}=(0,l.useContext)(ke),Q=a.reviewThread&&(a.reviewThread.canResolve&&!a.reviewThread.isResolved||a.reviewThread.canUnresolve&&a.reviewThread.isResolved),F=i(()=>{if(a.reviewThread){const le=!y;p(!le),C(le),R(a.reviewThread.threadId,o,le)}},"toggleResolve");return l.createElement("div",{key:a.id,className:"diff-container"},l.createElement("div",{className:"resolved-container"},l.createElement("div",null,c.position===null?l.createElement("span",null,l.createElement("span",null,c.path),l.createElement("span",{className:"outdatedLabel"},"Outdated")):l.createElement("a",{className:"diffPath",onClick:i(()=>x(c),"onClick")},c.path),!y&&!d?l.createElement("span",{className:"unresolvedLabel"},"Unresolved"):null),l.createElement("button",{className:"secondary",onClick:i(()=>p(!d),"onClick")},d?"Hide":"Show")),d?l.createElement("div",null,l.createElement(il,{hunks:(u=c.diffHunks)!=null?u:[]}),o.map(le=>l.createElement(cn,{key:le.id,comment:le})),Q?l.createElement("div",{className:"resolve-comment-row"},l.createElement("button",{className:"secondary comment-resolve",onClick:i(()=>F(),"onClick")},y?"Unresolve Conversation":"Resolve Conversation")):null):null)}i(Ns,"CommentThread");function Rs(){const{requestChanges:o,approve:a,submit:u,pr:c}=(0,l.useContext)(ke),d=c==null?void 0:c.isAuthor,p=(0,l.useRef)(),[y,C]=(0,l.useState)(!1),[x,R]=(0,l.useState)("");async function Q(P,Pe){P.preventDefault();const Ce=x;switch(C(!0),Pe){case Re.RequestChanges:await o(Ce);break;case Re.Approve:await a(Ce);break;default:await u(Ce)}C(!1)}i(Q,"submitAction");const F=i(P=>{(P.ctrlKey||P.metaKey)&&P.key==="Enter"&&Q(P,Re.Comment)},"onKeyDown"),le=i(P=>{R(P.target.value)},"onTextareaChange"),me=!x.trim()&&!c.hasReviewDraft;return l.createElement("form",null,l.createElement("textarea",{id:"pending-review",ref:p,placeholder:"Leave a review summary comment",onKeyDown:F,onChange:le,value:x}),l.createElement("div",{className:"form-actions"},d?null:l.createElement("button",{id:"request-changes",className:"secondary",disabled:y||c.busy||me,onClick:i(P=>Q(P,Re.RequestChanges),"onClick")},"Request Changes"),d?null:l.createElement("button",{id:"approve",className:"secondary",disabled:y||c.busy,onClick:i(P=>Q(P,Re.Approve),"onClick")},"Approve"),l.createElement("button",{disabled:y||c.busy||me,onClick:i(P=>Q(P,Re.Comment),"onClick")},"Submit Review")))}i(Rs,"AddReviewSummaryComment");const Ps=i(o=>l.createElement(cn,{headerInEditMode:!0,comment:o}),"CommentEventView"),Os=i(o=>{const{revert:a,pr:u}=(0,l.useContext)(ke);return l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},Tr,lt,l.createElement("div",{className:"avatar-container"},l.createElement(st,{for:o.user})),l.createElement(ht,{for:o.user}),l.createElement("div",{className:"message"},"merged commit",lt,l.createElement("a",{className:"sha",href:o.commitUrl,title:o.commitUrl},o.sha.substr(0,7)),lt,"into ",o.mergeRef,lt)),u.revertable?l.createElement("div",{className:"timeline-detail"},l.createElement("button",{className:"secondary",disabled:u.busy,onClick:a},"Revert")):null,l.createElement(Mt,{href:o.url,date:o.createdAt}))},"MergedEventView"),Ds=i(o=>l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},l.createElement("div",{className:"avatar-container"},l.createElement(st,{for:o.actor})),l.createElement(ht,{for:o.actor}),l.createElement("div",{className:"message"},"deleted the ",o.headRef," branch",lt)),l.createElement(Mt,{date:o.createdAt})),"HeadDeleteEventView"),As=i(o=>{const{source:a}=o;return l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},l.createElement("div",{className:"avatar-container"},l.createElement(st,{for:o.actor})),l.createElement(ht,{for:o.actor}),l.createElement("div",{className:"message"},"linked ",l.createElement("a",{href:a.extensionUrl},"#",a.number)," ",a.title,lt,o.willCloseTarget?"which will close this issue":"")),l.createElement(Mt,{date:o.createdAt}))},"CrossReferencedEventView");function ll(o){return o.length===0?l.createElement(l.Fragment,null):o.length===1?o[0]:o.length===2?l.createElement(l.Fragment,null,o[0]," and ",o[1]):l.createElement(l.Fragment,null,o.slice(0,-1).map(a=>l.createElement(l.Fragment,null,a,", "))," and ",o[o.length-1])}i(ll,"timeline_joinWithAnd");const Ur=i(({event:o})=>{const{actor:a}=o,u=o.assignees||[],c=o.unassignees||[],d=ll(u.map(C=>l.createElement(ht,{key:`${C.id}a`,for:C}))),p=ll(c.map(C=>l.createElement(ht,{key:`${C.id}u`,for:C})));let y;return u.length>0&&c.length>0?y=l.createElement(l.Fragment,null,"assigned ",d," and unassigned ",p):u.length>0?y=l.createElement(l.Fragment,null,"assigned ",d):y=l.createElement(l.Fragment,null,"unassigned ",p),l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},l.createElement("div",{className:"avatar-container"},l.createElement(st,{for:a})),l.createElement(ht,{for:a}),l.createElement("div",{className:"message"},y)),l.createElement(Mt,{date:o.createdAt}))},"AssignUnassignEventView"),Pn=i(({event:o,isIssue:a})=>{const{actor:u,createdAt:c}=o;return l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},l.createElement("div",{className:"avatar-container"},l.createElement(st,{for:u})),l.createElement(ht,{for:u}),l.createElement("div",{className:"message"},a?"closed this issue":"closed this pull request")),l.createElement(Mt,{date:c}))},"ClosedEventView"),Ge=i(({event:o,isIssue:a})=>{const{actor:u,createdAt:c}=o;return l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},l.createElement("div",{className:"avatar-container"},l.createElement(st,{for:u})),l.createElement(ht,{for:u}),l.createElement("div",{className:"message"},a?"reopened this issue":"reopened this pull request")),l.createElement(Mt,{date:c}))},"ReopenedEventView"),et=i(o=>{const{createdAt:a,onBehalfOf:u,sessionLink:c}=o,{openSessionLog:d}=(0,l.useContext)(ke),p=i(y=>{c&&(c.openToTheSide=y.ctrlKey||y.metaKey,d(c))},"handleSessionLogClick");return l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},Ci,lt,l.createElement("div",{className:"message"},"Copilot started work on behalf of ",l.createElement(ht,{for:u}))),c?l.createElement("div",{className:"timeline-detail"},l.createElement("a",{onClick:p},l.createElement("button",{className:"secondary",title:"View session log (Ctrl/Cmd+Click to open in second editor group)"},"View session"))):null,l.createElement(Mt,{date:a}))},"CopilotStartedEventView"),Yt=i(o=>{const{createdAt:a,onBehalfOf:u}=o;return l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"commit-message"},wi,lt,l.createElement("div",{className:"message"},"Copilot finished work on behalf of ",l.createElement(ht,{for:u}))),l.createElement(Mt,{date:a}))},"CopilotFinishedEventView"),ft=i(o=>{const{createdAt:a,onBehalfOf:u}=o,{openSessionLog:c}=(0,l.useContext)(ke),d=i(p=>{o.sessionLink.openToTheSide=p.ctrlKey||p.metaKey,c(o.sessionLink)},"handleSessionLogClick");return l.createElement("div",{className:"comment-container commit"},l.createElement("div",{className:"timeline-with-detail"},l.createElement("div",{className:"commit-message"},fo,lt,l.createElement("div",{className:"message"},"Copilot stopped work on behalf of ",l.createElement(ht,{for:u})," due to an error")),l.createElement("div",{className:"commit-message-detail"},l.createElement("a",{onClick:d,title:"View session log (Ctrl/Cmd+Click to open in second editor group)"},"Copilot has encountered an error. See logs for additional details."))),l.createElement(Mt,{date:a}))},"CopilotFinishedErrorEventView"),Ct=i(o=>{const[a,u]=l.useState(window.matchMedia(o).matches);return l.useEffect(()=>{const c=window.matchMedia(o),d=i(()=>u(c.matches),"documentChangeHandler");return c.addEventListener("change",d),()=>{c.removeEventListener("change",d)}},[o]),a},"useMediaQuery"),fn=i(o=>{const a=Ct("(max-width: 768px)");return l.createElement(l.Fragment,null,l.createElement("div",{id:"title",className:"title"},l.createElement("div",{className:"details"},l.createElement(Po,{...o}))),a?l.createElement(l.Fragment,null,l.createElement(Ji,{...o}),l.createElement(mn,{...o})):l.createElement(l.Fragment,null,l.createElement(mn,{...o}),l.createElement(Vr,{...o})))},"Overview"),mn=i(o=>l.createElement("div",{id:"main"},l.createElement("div",{id:"description"},l.createElement(cn,{isPRDescription:!0,comment:o})),l.createElement(_s,{events:o.events,isIssue:o.isIssue}),l.createElement(cs,{pr:o,isSimple:!1}),l.createElement(Ii,{...o})),"Main");function wt(){(0,ie.render)(l.createElement(Wr,null,o=>l.createElement(fn,{...o})),document.getElementById("app"))}i(wt,"main");function Wr({children:o}){const a=(0,l.useContext)(ke),[u,c]=(0,l.useState)(a.pr);return(0,l.useEffect)(()=>{a.onchange=c,c(a.pr)},[]),window.onscroll=N(()=>{a.postMessage({command:"scroll",args:{scrollPosition:{x:window.scrollX,y:window.scrollY}}})},200),a.postMessage({command:"ready"}),a.postMessage({command:"pr.debug",args:"initialized "+(u?"with PR":"without PR")}),u?o(u):l.createElement("div",{className:"loading-indicator"},"Loading...")}i(Wr,"Root"),addEventListener("load",wt)})()})();
