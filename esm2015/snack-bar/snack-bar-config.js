/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
/**
 * Injection token that can be used to access the data that was passed in to a snack bar.
 * @type {?}
 */
export const MAT_SNACK_BAR_DATA = new InjectionToken('MatSnackBarData');
/**
 * Configuration used when opening a snack-bar.
 * @template D
 */
export class MatSnackBarConfig {
    constructor() {
        /**
         * The politeness level for the MatAriaLiveAnnouncer announcement.
         */
        this.politeness = 'assertive';
        /**
         * Message to be announced by the LiveAnnouncer. When opening a snackbar without a custom
         * component or template, the announcement message will default to the specified message.
         */
        this.announcementMessage = '';
        /**
         * The length of time in milliseconds to wait before automatically dismissing the snack bar.
         */
        this.duration = 0;
        /**
         * Data being injected into the child component.
         */
        this.data = null;
        /**
         * The horizontal position to place the snack bar.
         */
        this.horizontalPosition = 'center';
        /**
         * The vertical position to place the snack bar.
         */
        this.verticalPosition = 'bottom';
    }
}
if (false) {
    /**
     * The politeness level for the MatAriaLiveAnnouncer announcement.
     * @type {?}
     */
    MatSnackBarConfig.prototype.politeness;
    /**
     * Message to be announced by the LiveAnnouncer. When opening a snackbar without a custom
     * component or template, the announcement message will default to the specified message.
     * @type {?}
     */
    MatSnackBarConfig.prototype.announcementMessage;
    /**
     * The view container to place the overlay for the snack bar into.
     * @type {?}
     */
    MatSnackBarConfig.prototype.viewContainerRef;
    /**
     * The length of time in milliseconds to wait before automatically dismissing the snack bar.
     * @type {?}
     */
    MatSnackBarConfig.prototype.duration;
    /**
     * Extra CSS classes to be added to the snack bar container.
     * @type {?}
     */
    MatSnackBarConfig.prototype.panelClass;
    /**
     * Text layout direction for the snack bar.
     * @type {?}
     */
    MatSnackBarConfig.prototype.direction;
    /**
     * Data being injected into the child component.
     * @type {?}
     */
    MatSnackBarConfig.prototype.data;
    /**
     * The horizontal position to place the snack bar.
     * @type {?}
     */
    MatSnackBarConfig.prototype.horizontalPosition;
    /**
     * The vertical position to place the snack bar.
     * @type {?}
     */
    MatSnackBarConfig.prototype.verticalPosition;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hY2stYmFyLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zbmFjay1iYXIvc25hY2stYmFyLWNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBbUIsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7OztBQUsvRCxNQUFNLE9BQU8sa0JBQWtCLEdBQUcsSUFBSSxjQUFjLENBQU0saUJBQWlCLENBQUM7Ozs7O0FBVzVFLE1BQU0sT0FBTyxpQkFBaUI7SUFBOUI7Ozs7UUFFRSxlQUFVLEdBQXdCLFdBQVcsQ0FBQzs7Ozs7UUFNOUMsd0JBQW1CLEdBQVksRUFBRSxDQUFDOzs7O1FBTWxDLGFBQVEsR0FBWSxDQUFDLENBQUM7Ozs7UUFTdEIsU0FBSSxHQUFjLElBQUksQ0FBQzs7OztRQUd2Qix1QkFBa0IsR0FBbUMsUUFBUSxDQUFDOzs7O1FBRzlELHFCQUFnQixHQUFpQyxRQUFRLENBQUM7SUFDNUQsQ0FBQztDQUFBOzs7Ozs7SUE1QkMsdUNBQThDOzs7Ozs7SUFNOUMsZ0RBQWtDOzs7OztJQUdsQyw2Q0FBb0M7Ozs7O0lBR3BDLHFDQUFzQjs7Ozs7SUFHdEIsdUNBQStCOzs7OztJQUcvQixzQ0FBc0I7Ozs7O0lBR3RCLGlDQUF1Qjs7Ozs7SUFHdkIsK0NBQThEOzs7OztJQUc5RCw2Q0FBMEQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmLCBJbmplY3Rpb25Ub2tlbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0FyaWFMaXZlUG9saXRlbmVzc30gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaXJlY3Rpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGFjY2VzcyB0aGUgZGF0YSB0aGF0IHdhcyBwYXNzZWQgaW4gdG8gYSBzbmFjayBiYXIuICovXG5leHBvcnQgY29uc3QgTUFUX1NOQUNLX0JBUl9EQVRBID0gbmV3IEluamVjdGlvblRva2VuPGFueT4oJ01hdFNuYWNrQmFyRGF0YScpO1xuXG4vKiogUG9zc2libGUgdmFsdWVzIGZvciBob3Jpem9udGFsUG9zaXRpb24gb24gTWF0U25hY2tCYXJDb25maWcuICovXG5leHBvcnQgdHlwZSBNYXRTbmFja0Jhckhvcml6b250YWxQb3NpdGlvbiA9ICdzdGFydCcgfCAnY2VudGVyJyB8ICdlbmQnIHwgJ2xlZnQnIHwgJ3JpZ2h0JztcblxuLyoqIFBvc3NpYmxlIHZhbHVlcyBmb3IgdmVydGljYWxQb3NpdGlvbiBvbiBNYXRTbmFja0JhckNvbmZpZy4gKi9cbmV4cG9ydCB0eXBlIE1hdFNuYWNrQmFyVmVydGljYWxQb3NpdGlvbiA9ICd0b3AnIHwgJ2JvdHRvbSc7XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiB1c2VkIHdoZW4gb3BlbmluZyBhIHNuYWNrLWJhci5cbiAqL1xuZXhwb3J0IGNsYXNzIE1hdFNuYWNrQmFyQ29uZmlnPEQgPSBhbnk+IHtcbiAgLyoqIFRoZSBwb2xpdGVuZXNzIGxldmVsIGZvciB0aGUgTWF0QXJpYUxpdmVBbm5vdW5jZXIgYW5ub3VuY2VtZW50LiAqL1xuICBwb2xpdGVuZXNzPzogQXJpYUxpdmVQb2xpdGVuZXNzID0gJ2Fzc2VydGl2ZSc7XG5cbiAgLyoqXG4gICAqIE1lc3NhZ2UgdG8gYmUgYW5ub3VuY2VkIGJ5IHRoZSBMaXZlQW5ub3VuY2VyLiBXaGVuIG9wZW5pbmcgYSBzbmFja2JhciB3aXRob3V0IGEgY3VzdG9tXG4gICAqIGNvbXBvbmVudCBvciB0ZW1wbGF0ZSwgdGhlIGFubm91bmNlbWVudCBtZXNzYWdlIHdpbGwgZGVmYXVsdCB0byB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UuXG4gICAqL1xuICBhbm5vdW5jZW1lbnRNZXNzYWdlPzogc3RyaW5nID0gJyc7XG5cbiAgLyoqIFRoZSB2aWV3IGNvbnRhaW5lciB0byBwbGFjZSB0aGUgb3ZlcmxheSBmb3IgdGhlIHNuYWNrIGJhciBpbnRvLiAqL1xuICB2aWV3Q29udGFpbmVyUmVmPzogVmlld0NvbnRhaW5lclJlZjtcblxuICAvKiogVGhlIGxlbmd0aCBvZiB0aW1lIGluIG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBhdXRvbWF0aWNhbGx5IGRpc21pc3NpbmcgdGhlIHNuYWNrIGJhci4gKi9cbiAgZHVyYXRpb24/OiBudW1iZXIgPSAwO1xuXG4gIC8qKiBFeHRyYSBDU1MgY2xhc3NlcyB0byBiZSBhZGRlZCB0byB0aGUgc25hY2sgYmFyIGNvbnRhaW5lci4gKi9cbiAgcGFuZWxDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdO1xuXG4gIC8qKiBUZXh0IGxheW91dCBkaXJlY3Rpb24gZm9yIHRoZSBzbmFjayBiYXIuICovXG4gIGRpcmVjdGlvbj86IERpcmVjdGlvbjtcblxuICAvKiogRGF0YSBiZWluZyBpbmplY3RlZCBpbnRvIHRoZSBjaGlsZCBjb21wb25lbnQuICovXG4gIGRhdGE/OiBEIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFRoZSBob3Jpem9udGFsIHBvc2l0aW9uIHRvIHBsYWNlIHRoZSBzbmFjayBiYXIuICovXG4gIGhvcml6b250YWxQb3NpdGlvbj86IE1hdFNuYWNrQmFySG9yaXpvbnRhbFBvc2l0aW9uID0gJ2NlbnRlcic7XG5cbiAgLyoqIFRoZSB2ZXJ0aWNhbCBwb3NpdGlvbiB0byBwbGFjZSB0aGUgc25hY2sgYmFyLiAqL1xuICB2ZXJ0aWNhbFBvc2l0aW9uPzogTWF0U25hY2tCYXJWZXJ0aWNhbFBvc2l0aW9uID0gJ2JvdHRvbSc7XG59XG4iXX0=