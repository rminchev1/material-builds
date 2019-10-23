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
export { MatTabsModule } from './tabs-module';
export { MatTabChangeEvent, MAT_TABS_CONFIG, _MatTabGroupBase, MatTabGroup } from './tab-group';
export { MatInkBar, _MAT_INK_BAR_POSITIONER } from './ink-bar';
export { MatTabBody, _MatTabBodyBase, MatTabBodyPortal } from './tab-body';
export { MatTabHeader, _MatTabHeaderBase } from './tab-header';
export { MatTabLabelWrapper } from './tab-label-wrapper';
export { MatTab, MAT_TAB_GROUP } from './tab';
export { MatTabLabel } from './tab-label';
export { MatTabNav, MatTabLink, _MatTabNavBase, _MatTabLinkBase } from './tab-nav-bar/index';
export { MatTabContent } from './tab-content';
export { matTabsAnimations } from './tabs-animations';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90YWJzL3B1YmxpYy1hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVDLGtGQUFjLGFBQWEsQ0FBQztBQUM1QixPQUFPLEVBQUMsU0FBUyxFQUF3Qix1QkFBdUIsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUNuRixPQUFPLEVBQ0wsVUFBVSxFQUNWLGVBQWUsRUFHZixnQkFBZ0IsRUFDakIsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUM3RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsTUFBTSxFQUFFLGFBQWEsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUM1QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMzRixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTVDLGtDQUFjLG1CQUFtQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCB7TWF0VGFic01vZHVsZX0gZnJvbSAnLi90YWJzLW1vZHVsZSc7XG5leHBvcnQgKiBmcm9tICcuL3RhYi1ncm91cCc7XG5leHBvcnQge01hdElua0JhciwgX01hdElua0JhclBvc2l0aW9uZXIsIF9NQVRfSU5LX0JBUl9QT1NJVElPTkVSfSBmcm9tICcuL2luay1iYXInO1xuZXhwb3J0IHtcbiAgTWF0VGFiQm9keSxcbiAgX01hdFRhYkJvZHlCYXNlLFxuICBNYXRUYWJCb2R5T3JpZ2luU3RhdGUsXG4gIE1hdFRhYkJvZHlQb3NpdGlvblN0YXRlLFxuICBNYXRUYWJCb2R5UG9ydGFsXG59IGZyb20gJy4vdGFiLWJvZHknO1xuZXhwb3J0IHtNYXRUYWJIZWFkZXIsIF9NYXRUYWJIZWFkZXJCYXNlfSBmcm9tICcuL3RhYi1oZWFkZXInO1xuZXhwb3J0IHtNYXRUYWJMYWJlbFdyYXBwZXJ9IGZyb20gJy4vdGFiLWxhYmVsLXdyYXBwZXInO1xuZXhwb3J0IHtNYXRUYWIsIE1BVF9UQUJfR1JPVVB9IGZyb20gJy4vdGFiJztcbmV4cG9ydCB7TWF0VGFiTGFiZWx9IGZyb20gJy4vdGFiLWxhYmVsJztcbmV4cG9ydCB7TWF0VGFiTmF2LCBNYXRUYWJMaW5rLCBfTWF0VGFiTmF2QmFzZSwgX01hdFRhYkxpbmtCYXNlfSBmcm9tICcuL3RhYi1uYXYtYmFyL2luZGV4JztcbmV4cG9ydCB7TWF0VGFiQ29udGVudH0gZnJvbSAnLi90YWItY29udGVudCc7XG5leHBvcnQge1Njcm9sbERpcmVjdGlvbn0gZnJvbSAnLi9wYWdpbmF0ZWQtdGFiLWhlYWRlcic7XG5leHBvcnQgKiBmcm9tICcuL3RhYnMtYW5pbWF0aW9ucyc7XG4iXX0=