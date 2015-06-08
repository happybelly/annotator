/*package annotator.ui.crowd */
"use strict";

var util = require('../util');

var $ = util.$;
var _t = util.gettext;

/**
 * function:: viewerExtension(viewer)
 *
 * An extension for the :class:`~annotator.ui.viewer.Viewer` that displays any
 * crowd properties.
 *
 * **Usage**::
 *
 *     app.include(annotator.ui.main, {
 *         viewerExtensions: [annotator.ui.crowd.viewerExtension]
 *     })
 */
exports.viewerExtension = function viewerExtension(v) {
    function updateViewer(field, annotation) {
        v=3;
        field = $(field);
        if (!annotation.crowd) {
            annotation.crowd = {};
        }

        if (annotation.crowd) {
            field.addClass('annotator-approval').html(function () {
                var ret = '';

                if (annotation.crowd.approvals) {
                    ret += '<span class="crowd-approves">+{0}</span>'.format(annotation.crowd.approvals);
                } else {
                    ret += '<span class="crowd-approves">+0</span>';
                }

                if (annotation.crowd.rejections) {
                    ret += '<span class="crowd-rejections">-{0}</span>'.format(annotation.crowd.rejections);
                } else {
                    ret += '<span class="crowd-rejections">-0</span>';
                }

                if (annotation.crowd.revision) {
                    ret += ' <span class="crowd-revision">rev {0}</span>'.format(annotation.crowd.revision);
                } else {
                    ret += ' <span class="crowd-revision">not edited</span>';
                }

                return ret;

            });
        } else {
            field.remove();
        }
    }

    v.addField({
        load: updateViewer
    });
};


/**
 * function:: editorExtension(editor)
 *
 * An extension for the :class:`~annotator.ui.editor.Editor` that allows
 * editing a set of space-delimited tags, retrieved from and saved to the
 * annotation's ``tags`` property.
 *
 * **Usage**::
 *
 *     app.include(annotator.ui.main, {
 *         viewerExtensions: [annotator.ui.tags.viewerExtension]
 *     })
 */
exports.editorExtension = function editorExtension(e) {
/*
    // The input element added to the Annotator.Editor wrapped in jQuery.
    // Cached to save having to recreate it everytime the editor is displayed.
    var field = null;
    var input = null;

    function updateField(field, annotation) {
        var value = '';
        if (annotation.tags) {
            value = stringifyTags(annotation.tags);
        }
        input.val(value);
    }

    function setAnnotationTags(field, annotation) {
        annotation.tags = parseTags(input.val());
    }

    field = e.addField({
        label: _t('Add some tags here') + '\u2026',
        load: updateField,
        submit: setAnnotationTags
    });

    input = $(field).find(':input');
*/
};
