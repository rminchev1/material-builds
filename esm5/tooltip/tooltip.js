import { __assign } from "tslib";
import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Overlay, } from '@angular/cdk/overlay';
import { Platform, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Directive, ElementRef, Inject, InjectionToken, Input, NgZone, Optional, ViewContainerRef, ViewEncapsulation, } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { matTooltipAnimations } from './tooltip-animations';
/** Time in ms to throttle repositioning after scroll events. */
export var SCROLL_THROTTLE_MS = 20;
/** CSS class that will be attached to the overlay panel. */
export var TOOLTIP_PANEL_CLASS = 'mat-tooltip-panel';
/** Options used to bind passive event listeners. */
var passiveListenerOptions = normalizePassiveListenerOptions({ passive: true });
/**
 * Time between the user putting the pointer on a tooltip
 * trigger and the long press event being fired.
 */
var LONGPRESS_DELAY = 500;
/**
 * Creates an error to be thrown if the user supplied an invalid tooltip position.
 * @docs-private
 */
export function getMatTooltipInvalidPositionError(position) {
    return Error("Tooltip position \"" + position + "\" is invalid.");
}
/** Injection token that determines the scroll handling while a tooltip is visible. */
export var MAT_TOOLTIP_SCROLL_STRATEGY = new InjectionToken('mat-tooltip-scroll-strategy');
/** @docs-private */
export function MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY(overlay) {
    return function () { return overlay.scrollStrategies.reposition({ scrollThrottle: SCROLL_THROTTLE_MS }); };
}
/** @docs-private */
export var MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MAT_TOOLTIP_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY,
};
/** Injection token to be used to override the default options for `matTooltip`. */
export var MAT_TOOLTIP_DEFAULT_OPTIONS = new InjectionToken('mat-tooltip-default-options', {
    providedIn: 'root',
    factory: MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY
});
/** @docs-private */
export function MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY() {
    return {
        showDelay: 0,
        hideDelay: 0,
        touchendHideDelay: 1500,
    };
}
/**
 * Directive that attaches a material design tooltip to the host element. Animates the showing and
 * hiding of a tooltip provided position (defaults to below the element).
 *
 * https://material.io/design/components/tooltips.html
 */
var MatTooltip = /** @class */ (function () {
    function MatTooltip(_overlay, _elementRef, _scrollDispatcher, _viewContainerRef, _ngZone, _platform, _ariaDescriber, _focusMonitor, scrollStrategy, _dir, _defaultOptions, 
    /**
     * @deprecated _hammerLoader parameter to be removed.
     * @breaking-change 9.0.0
     */
    // Note that we need to give Angular something to inject here so it doesn't throw.
    _hammerLoader) {
        var _this = this;
        this._overlay = _overlay;
        this._elementRef = _elementRef;
        this._scrollDispatcher = _scrollDispatcher;
        this._viewContainerRef = _viewContainerRef;
        this._ngZone = _ngZone;
        this._platform = _platform;
        this._ariaDescriber = _ariaDescriber;
        this._focusMonitor = _focusMonitor;
        this._dir = _dir;
        this._defaultOptions = _defaultOptions;
        this._position = 'below';
        this._disabled = false;
        /** The default delay in ms before showing the tooltip after show is called */
        this.showDelay = this._defaultOptions.showDelay;
        /** The default delay in ms before hiding the tooltip after hide is called */
        this.hideDelay = this._defaultOptions.hideDelay;
        /**
         * How touch gestures should be handled by the tooltip. On touch devices the tooltip directive
         * uses a long press gesture to show and hide, however it can conflict with the native browser
         * gestures. To work around the conflict, Angular Material disables native gestures on the
         * trigger, but that might not be desirable on particular elements (e.g. inputs and draggable
         * elements). The different values for this option configure the touch event handling as follows:
         * - `auto` - Enables touch gestures for all elements, but tries to avoid conflicts with native
         *   browser gestures on particular elements. In particular, it allows text selection on inputs
         *   and textareas, and preserves the native browser dragging on elements marked as `draggable`.
         * - `on` - Enables touch gestures for all elements and disables native
         *   browser gestures with no exceptions.
         * - `off` - Disables touch gestures. Note that this will prevent the tooltip from
         *   showing on touch devices.
         */
        this.touchGestures = 'auto';
        this._message = '';
        /** Manually-bound passive event listeners. */
        this._passiveListeners = new Map();
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /**
         * Handles the keydown events on the host element.
         * Needs to be an arrow function so that we can use it in addEventListener.
         */
        this._handleKeydown = function (event) {
            if (_this._isTooltipVisible() && event.keyCode === ESCAPE && !hasModifierKey(event)) {
                event.preventDefault();
                event.stopPropagation();
                _this._ngZone.run(function () { return _this.hide(0); });
            }
        };
        this._scrollStrategy = scrollStrategy;
        if (_defaultOptions) {
            if (_defaultOptions.position) {
                this.position = _defaultOptions.position;
            }
            if (_defaultOptions.touchGestures) {
                this.touchGestures = _defaultOptions.touchGestures;
            }
        }
        _focusMonitor.monitor(_elementRef)
            .pipe(takeUntil(this._destroyed))
            .subscribe(function (origin) {
            // Note that the focus monitor runs outside the Angular zone.
            if (!origin) {
                _ngZone.run(function () { return _this.hide(0); });
            }
            else if (origin === 'keyboard') {
                _ngZone.run(function () { return _this.show(); });
            }
        });
        _ngZone.runOutsideAngular(function () {
            _elementRef.nativeElement.addEventListener('keydown', _this._handleKeydown);
        });
    }
    Object.defineProperty(MatTooltip.prototype, "position", {
        /** Allows the user to define the position of the tooltip relative to the parent element */
        get: function () { return this._position; },
        set: function (value) {
            if (value !== this._position) {
                this._position = value;
                if (this._overlayRef) {
                    this._updatePosition();
                    if (this._tooltipInstance) {
                        this._tooltipInstance.show(0);
                    }
                    this._overlayRef.updatePosition();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MatTooltip.prototype, "disabled", {
        /** Disables the display of the tooltip. */
        get: function () { return this._disabled; },
        set: function (value) {
            this._disabled = coerceBooleanProperty(value);
            // If tooltip is disabled, hide immediately.
            if (this._disabled) {
                this.hide(0);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MatTooltip.prototype, "message", {
        /** The message to be displayed in the tooltip */
        get: function () { return this._message; },
        set: function (value) {
            var _this = this;
            this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._message);
            // If the message is not a string (e.g. number), convert it to a string and trim it.
            this._message = value != null ? ("" + value).trim() : '';
            if (!this._message && this._isTooltipVisible()) {
                this.hide(0);
            }
            else {
                this._updateTooltipMessage();
                this._ngZone.runOutsideAngular(function () {
                    // The `AriaDescriber` has some functionality that avoids adding a description if it's the
                    // same as the `aria-label` of an element, however we can't know whether the tooltip trigger
                    // has a data-bound `aria-label` or when it'll be set for the first time. We can avoid the
                    // issue by deferring the description by a tick so Angular has time to set the `aria-label`.
                    Promise.resolve().then(function () {
                        _this._ariaDescriber.describe(_this._elementRef.nativeElement, _this.message);
                    });
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MatTooltip.prototype, "tooltipClass", {
        /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
        get: function () { return this._tooltipClass; },
        set: function (value) {
            this._tooltipClass = value;
            if (this._tooltipInstance) {
                this._setTooltipClass(this._tooltipClass);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Setup styling-specific things
     */
    MatTooltip.prototype.ngOnInit = function () {
        // This needs to happen in `ngOnInit` so the initial values for all inputs have been set.
        this._setupPointerEvents();
    };
    /**
     * Dispose the tooltip when destroyed.
     */
    MatTooltip.prototype.ngOnDestroy = function () {
        var nativeElement = this._elementRef.nativeElement;
        clearTimeout(this._touchstartTimeout);
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._tooltipInstance = null;
        }
        // Clean up the event listeners set in the constructor
        nativeElement.removeEventListener('keydown', this._handleKeydown);
        this._passiveListeners.forEach(function (listener, event) {
            nativeElement.removeEventListener(event, listener, passiveListenerOptions);
        });
        this._passiveListeners.clear();
        this._destroyed.next();
        this._destroyed.complete();
        this._ariaDescriber.removeDescription(nativeElement, this.message);
        this._focusMonitor.stopMonitoring(nativeElement);
    };
    /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
    MatTooltip.prototype.show = function (delay) {
        var _this = this;
        if (delay === void 0) { delay = this.showDelay; }
        if (this.disabled || !this.message || (this._isTooltipVisible() &&
            !this._tooltipInstance._showTimeoutId && !this._tooltipInstance._hideTimeoutId)) {
            return;
        }
        var overlayRef = this._createOverlay();
        this._detach();
        this._portal = this._portal || new ComponentPortal(TooltipComponent, this._viewContainerRef);
        this._tooltipInstance = overlayRef.attach(this._portal).instance;
        this._tooltipInstance.afterHidden()
            .pipe(takeUntil(this._destroyed))
            .subscribe(function () { return _this._detach(); });
        this._setTooltipClass(this._tooltipClass);
        this._updateTooltipMessage();
        this._tooltipInstance.show(delay);
    };
    /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
    MatTooltip.prototype.hide = function (delay) {
        if (delay === void 0) { delay = this.hideDelay; }
        if (this._tooltipInstance) {
            this._tooltipInstance.hide(delay);
        }
    };
    /** Shows/hides the tooltip */
    MatTooltip.prototype.toggle = function () {
        this._isTooltipVisible() ? this.hide() : this.show();
    };
    /** Returns true if the tooltip is currently visible to the user */
    MatTooltip.prototype._isTooltipVisible = function () {
        return !!this._tooltipInstance && this._tooltipInstance.isVisible();
    };
    /** Create the overlay config and position strategy */
    MatTooltip.prototype._createOverlay = function () {
        var _this = this;
        if (this._overlayRef) {
            return this._overlayRef;
        }
        var scrollableAncestors = this._scrollDispatcher.getAncestorScrollContainers(this._elementRef);
        // Create connected position strategy that listens for scroll events to reposition.
        var strategy = this._overlay.position()
            .flexibleConnectedTo(this._elementRef)
            .withTransformOriginOn('.mat-tooltip')
            .withFlexibleDimensions(false)
            .withViewportMargin(8)
            .withScrollableContainers(scrollableAncestors);
        strategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe(function (change) {
            if (_this._tooltipInstance) {
                if (change.scrollableViewProperties.isOverlayClipped && _this._tooltipInstance.isVisible()) {
                    // After position changes occur and the overlay is clipped by
                    // a parent scrollable then close the tooltip.
                    _this._ngZone.run(function () { return _this.hide(0); });
                }
            }
        });
        this._overlayRef = this._overlay.create({
            direction: this._dir,
            positionStrategy: strategy,
            panelClass: TOOLTIP_PANEL_CLASS,
            scrollStrategy: this._scrollStrategy()
        });
        this._updatePosition();
        this._overlayRef.detachments()
            .pipe(takeUntil(this._destroyed))
            .subscribe(function () { return _this._detach(); });
        return this._overlayRef;
    };
    /** Detaches the currently-attached tooltip. */
    MatTooltip.prototype._detach = function () {
        if (this._overlayRef && this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
        }
        this._tooltipInstance = null;
    };
    /** Updates the position of the current tooltip. */
    MatTooltip.prototype._updatePosition = function () {
        var position = this._overlayRef.getConfig().positionStrategy;
        var origin = this._getOrigin();
        var overlay = this._getOverlayPosition();
        position.withPositions([
            __assign(__assign({}, origin.main), overlay.main),
            __assign(__assign({}, origin.fallback), overlay.fallback)
        ]);
    };
    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    MatTooltip.prototype._getOrigin = function () {
        var isLtr = !this._dir || this._dir.value == 'ltr';
        var position = this.position;
        var originPosition;
        if (position == 'above' || position == 'below') {
            originPosition = { originX: 'center', originY: position == 'above' ? 'top' : 'bottom' };
        }
        else if (position == 'before' ||
            (position == 'left' && isLtr) ||
            (position == 'right' && !isLtr)) {
            originPosition = { originX: 'start', originY: 'center' };
        }
        else if (position == 'after' ||
            (position == 'right' && isLtr) ||
            (position == 'left' && !isLtr)) {
            originPosition = { originX: 'end', originY: 'center' };
        }
        else {
            throw getMatTooltipInvalidPositionError(position);
        }
        var _a = this._invertPosition(originPosition.originX, originPosition.originY), x = _a.x, y = _a.y;
        return {
            main: originPosition,
            fallback: { originX: x, originY: y }
        };
    };
    /** Returns the overlay position and a fallback position based on the user's preference */
    MatTooltip.prototype._getOverlayPosition = function () {
        var isLtr = !this._dir || this._dir.value == 'ltr';
        var position = this.position;
        var overlayPosition;
        if (position == 'above') {
            overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
        }
        else if (position == 'below') {
            overlayPosition = { overlayX: 'center', overlayY: 'top' };
        }
        else if (position == 'before' ||
            (position == 'left' && isLtr) ||
            (position == 'right' && !isLtr)) {
            overlayPosition = { overlayX: 'end', overlayY: 'center' };
        }
        else if (position == 'after' ||
            (position == 'right' && isLtr) ||
            (position == 'left' && !isLtr)) {
            overlayPosition = { overlayX: 'start', overlayY: 'center' };
        }
        else {
            throw getMatTooltipInvalidPositionError(position);
        }
        var _a = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY), x = _a.x, y = _a.y;
        return {
            main: overlayPosition,
            fallback: { overlayX: x, overlayY: y }
        };
    };
    /** Updates the tooltip message and repositions the overlay according to the new message length */
    MatTooltip.prototype._updateTooltipMessage = function () {
        var _this = this;
        // Must wait for the message to be painted to the tooltip so that the overlay can properly
        // calculate the correct positioning based on the size of the text.
        if (this._tooltipInstance) {
            this._tooltipInstance.message = this.message;
            this._tooltipInstance._markForCheck();
            this._ngZone.onMicrotaskEmpty.asObservable().pipe(take(1), takeUntil(this._destroyed)).subscribe(function () {
                if (_this._tooltipInstance) {
                    _this._overlayRef.updatePosition();
                }
            });
        }
    };
    /** Updates the tooltip class */
    MatTooltip.prototype._setTooltipClass = function (tooltipClass) {
        if (this._tooltipInstance) {
            this._tooltipInstance.tooltipClass = tooltipClass;
            this._tooltipInstance._markForCheck();
        }
    };
    /** Inverts an overlay position. */
    MatTooltip.prototype._invertPosition = function (x, y) {
        if (this.position === 'above' || this.position === 'below') {
            if (y === 'top') {
                y = 'bottom';
            }
            else if (y === 'bottom') {
                y = 'top';
            }
        }
        else {
            if (x === 'end') {
                x = 'start';
            }
            else if (x === 'start') {
                x = 'end';
            }
        }
        return { x: x, y: y };
    };
    /** Binds the pointer events to the tooltip trigger. */
    MatTooltip.prototype._setupPointerEvents = function () {
        var _this = this;
        // The mouse events shouldn't be bound on mobile devices, because they can prevent the
        // first tap from firing its click event or can cause the tooltip to open for clicks.
        if (!this._platform.IOS && !this._platform.ANDROID) {
            this._passiveListeners
                .set('mouseenter', function () { return _this.show(); })
                .set('mouseleave', function () { return _this.hide(); });
        }
        else if (this.touchGestures !== 'off') {
            this._disableNativeGesturesIfNecessary();
            var touchendListener = function () {
                clearTimeout(_this._touchstartTimeout);
                _this.hide(_this._defaultOptions.touchendHideDelay);
            };
            this._passiveListeners
                .set('touchend', touchendListener)
                .set('touchcancel', touchendListener)
                .set('touchstart', function () {
                // Note that it's important that we don't `preventDefault` here,
                // because it can prevent click events from firing on the element.
                clearTimeout(_this._touchstartTimeout);
                _this._touchstartTimeout = setTimeout(function () { return _this.show(); }, LONGPRESS_DELAY);
            });
        }
        this._passiveListeners.forEach(function (listener, event) {
            _this._elementRef.nativeElement.addEventListener(event, listener, passiveListenerOptions);
        });
    };
    /** Disables the native browser gestures, based on how the tooltip has been configured. */
    MatTooltip.prototype._disableNativeGesturesIfNecessary = function () {
        var element = this._elementRef.nativeElement;
        var style = element.style;
        var gestures = this.touchGestures;
        if (gestures !== 'off') {
            // If gestures are set to `auto`, we don't disable text selection on inputs and
            // textareas, because it prevents the user from typing into them on iOS Safari.
            if (gestures === 'on' || (element.nodeName !== 'INPUT' && element.nodeName !== 'TEXTAREA')) {
                style.userSelect = style.msUserSelect = style.webkitUserSelect =
                    style.MozUserSelect = 'none';
            }
            // If we have `auto` gestures and the element uses native HTML dragging,
            // we don't set `-webkit-user-drag` because it prevents the native behavior.
            if (gestures === 'on' || !element.draggable) {
                style.webkitUserDrag = 'none';
            }
            style.touchAction = 'none';
            style.webkitTapHighlightColor = 'transparent';
        }
    };
    MatTooltip.decorators = [
        { type: Directive, args: [{
                    selector: '[matTooltip]',
                    exportAs: 'matTooltip',
                },] }
    ];
    /** @nocollapse */
    MatTooltip.ctorParameters = function () { return [
        { type: Overlay },
        { type: ElementRef },
        { type: ScrollDispatcher },
        { type: ViewContainerRef },
        { type: NgZone },
        { type: Platform },
        { type: AriaDescriber },
        { type: FocusMonitor },
        { type: undefined, decorators: [{ type: Inject, args: [MAT_TOOLTIP_SCROLL_STRATEGY,] }] },
        { type: Directionality, decorators: [{ type: Optional }] },
        { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MAT_TOOLTIP_DEFAULT_OPTIONS,] }] },
        { type: undefined, decorators: [{ type: Inject, args: [ElementRef,] }] }
    ]; };
    MatTooltip.propDecorators = {
        position: [{ type: Input, args: ['matTooltipPosition',] }],
        disabled: [{ type: Input, args: ['matTooltipDisabled',] }],
        showDelay: [{ type: Input, args: ['matTooltipShowDelay',] }],
        hideDelay: [{ type: Input, args: ['matTooltipHideDelay',] }],
        touchGestures: [{ type: Input, args: ['matTooltipTouchGestures',] }],
        message: [{ type: Input, args: ['matTooltip',] }],
        tooltipClass: [{ type: Input, args: ['matTooltipClass',] }]
    };
    return MatTooltip;
}());
export { MatTooltip };
/**
 * Internal component that wraps the tooltip's content.
 * @docs-private
 */
var TooltipComponent = /** @class */ (function () {
    function TooltipComponent(_changeDetectorRef, _breakpointObserver) {
        this._changeDetectorRef = _changeDetectorRef;
        this._breakpointObserver = _breakpointObserver;
        /** Property watched by the animation framework to show or hide the tooltip */
        this._visibility = 'initial';
        /** Whether interactions on the page should close the tooltip */
        this._closeOnInteraction = false;
        /** Subject for notifying that the tooltip has been hidden from the view */
        this._onHide = new Subject();
        /** Stream that emits whether the user has a handset-sized display.  */
        this._isHandset = this._breakpointObserver.observe(Breakpoints.Handset);
    }
    /**
     * Shows the tooltip with an animation originating from the provided origin
     * @param delay Amount of milliseconds to the delay showing the tooltip.
     */
    TooltipComponent.prototype.show = function (delay) {
        var _this = this;
        // Cancel the delayed hide if it is scheduled
        if (this._hideTimeoutId) {
            clearTimeout(this._hideTimeoutId);
            this._hideTimeoutId = null;
        }
        // Body interactions should cancel the tooltip if there is a delay in showing.
        this._closeOnInteraction = true;
        this._showTimeoutId = setTimeout(function () {
            _this._visibility = 'visible';
            _this._showTimeoutId = null;
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            _this._markForCheck();
        }, delay);
    };
    /**
     * Begins the animation to hide the tooltip after the provided delay in ms.
     * @param delay Amount of milliseconds to delay showing the tooltip.
     */
    TooltipComponent.prototype.hide = function (delay) {
        var _this = this;
        // Cancel the delayed show if it is scheduled
        if (this._showTimeoutId) {
            clearTimeout(this._showTimeoutId);
            this._showTimeoutId = null;
        }
        this._hideTimeoutId = setTimeout(function () {
            _this._visibility = 'hidden';
            _this._hideTimeoutId = null;
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            _this._markForCheck();
        }, delay);
    };
    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    TooltipComponent.prototype.afterHidden = function () {
        return this._onHide.asObservable();
    };
    /** Whether the tooltip is being displayed. */
    TooltipComponent.prototype.isVisible = function () {
        return this._visibility === 'visible';
    };
    TooltipComponent.prototype.ngOnDestroy = function () {
        this._onHide.complete();
    };
    TooltipComponent.prototype._animationStart = function () {
        this._closeOnInteraction = false;
    };
    TooltipComponent.prototype._animationDone = function (event) {
        var toState = event.toState;
        if (toState === 'hidden' && !this.isVisible()) {
            this._onHide.next();
        }
        if (toState === 'visible' || toState === 'hidden') {
            this._closeOnInteraction = true;
        }
    };
    /**
     * Interactions on the HTML body should close the tooltip immediately as defined in the
     * material design spec.
     * https://material.io/design/components/tooltips.html#behavior
     */
    TooltipComponent.prototype._handleBodyInteraction = function () {
        if (this._closeOnInteraction) {
            this.hide(0);
        }
    };
    /**
     * Marks that the tooltip needs to be checked in the next change detection run.
     * Mainly used for rendering the initial text before positioning a tooltip, which
     * can be problematic in components with OnPush change detection.
     */
    TooltipComponent.prototype._markForCheck = function () {
        this._changeDetectorRef.markForCheck();
    };
    TooltipComponent.decorators = [
        { type: Component, args: [{
                    moduleId: module.id,
                    selector: 'mat-tooltip-component',
                    template: "<div class=\"mat-tooltip\"\n     [ngClass]=\"tooltipClass\"\n     [class.mat-tooltip-handset]=\"(_isHandset | async)?.matches\"\n     [@state]=\"_visibility\"\n     (@state.start)=\"_animationStart()\"\n     (@state.done)=\"_animationDone($event)\">{{message}}</div>\n",
                    encapsulation: ViewEncapsulation.None,
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    animations: [matTooltipAnimations.tooltipState],
                    host: {
                        // Forces the element to have a layout in IE and Edge. This fixes issues where the element
                        // won't be rendered if the animations are disabled or there is no web animations polyfill.
                        '[style.zoom]': '_visibility === "visible" ? 1 : null',
                        '(body:click)': 'this._handleBodyInteraction()',
                        'aria-hidden': 'true',
                    },
                    styles: [".mat-tooltip-panel{pointer-events:none !important}.mat-tooltip{color:#fff;border-radius:4px;margin:14px;max-width:250px;padding-left:8px;padding-right:8px;overflow:hidden;text-overflow:ellipsis}@media(-ms-high-contrast: active){.mat-tooltip{outline:solid 1px}}.mat-tooltip-handset{margin:24px;padding-left:16px;padding-right:16px}\n"]
                }] }
    ];
    /** @nocollapse */
    TooltipComponent.ctorParameters = function () { return [
        { type: ChangeDetectorRef },
        { type: BreakpointObserver }
    ]; };
    return TooltipComponent;
}());
export { TooltipComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC90b29sdGlwL3Rvb2x0aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQVFBLE9BQU8sRUFBQyxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDOUQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzVELE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGtCQUFrQixFQUFFLFdBQVcsRUFBa0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRixPQUFPLEVBSUwsT0FBTyxHQUtSLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLFFBQVEsRUFBRSwrQkFBK0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2hGLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN4RCxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsU0FBUyxFQUNULFVBQVUsRUFDVixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFDTCxNQUFNLEVBR04sUUFBUSxFQUNSLGdCQUFnQixFQUNoQixpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFhLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUN6QyxPQUFPLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRS9DLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBZTFELGdFQUFnRTtB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LElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNkO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCx3Q0FBYSxHQUFiO1FBQ0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3pDLENBQUM7O2dCQXpJRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO29CQUNuQixRQUFRLEVBQUUsdUJBQXVCO29CQUNqQyx3UkFBMkI7b0JBRTNCLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO29CQUNyQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtvQkFDL0MsVUFBVSxFQUFFLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDO29CQUMvQyxJQUFJLEVBQUU7d0JBQ0osMEZBQTBGO3dCQUMxRiwyRkFBMkY7d0JBQzNGLGNBQWMsRUFBRSxzQ0FBc0M7d0JBQ3RELGNBQWMsRUFBRSwrQkFBK0I7d0JBQy9DLGFBQWEsRUFBRSxNQUFNO3FCQUN0Qjs7aUJBQ0Y7Ozs7Z0JBdGxCQyxpQkFBaUI7Z0JBaEJYLGtCQUFrQjs7SUFpdUIxQix1QkFBQztDQUFBLEFBMUlELElBMElDO1NBMUhZLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBbmltYXRpb25FdmVudH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge0FyaWFEZXNjcmliZXIsIEZvY3VzTW9uaXRvcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0VTQ0FQRSwgaGFzTW9kaWZpZXJLZXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XG5pbXBvcnQge0JyZWFrcG9pbnRPYnNlcnZlciwgQnJlYWtwb2ludHMsIEJyZWFrcG9pbnRTdGF0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2xheW91dCc7XG5pbXBvcnQge1xuICBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIEhvcml6b250YWxDb25uZWN0aW9uUG9zLFxuICBPcmlnaW5Db25uZWN0aW9uUG9zaXRpb24sXG4gIE92ZXJsYXksXG4gIE92ZXJsYXlDb25uZWN0aW9uUG9zaXRpb24sXG4gIE92ZXJsYXlSZWYsXG4gIFNjcm9sbFN0cmF0ZWd5LFxuICBWZXJ0aWNhbENvbm5lY3Rpb25Qb3MsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcbmltcG9ydCB7UGxhdGZvcm0sIG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge0NvbXBvbmVudFBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XG5pbXBvcnQge1Njcm9sbERpc3BhdGNoZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE9wdGlvbmFsLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHttYXRUb29sdGlwQW5pbWF0aW9uc30gZnJvbSAnLi90b29sdGlwLWFuaW1hdGlvbnMnO1xuXG5cbi8qKiBQb3NzaWJsZSBwb3NpdGlvbnMgZm9yIGEgdG9vbHRpcC4gKi9cbmV4cG9ydCB0eXBlIFRvb2x0aXBQb3NpdGlvbiA9ICdsZWZ0JyB8ICdyaWdodCcgfCAnYWJvdmUnIHwgJ2JlbG93JyB8ICdiZWZvcmUnIHwgJ2FmdGVyJztcblxuLyoqXG4gKiBPcHRpb25zIGZvciBob3cgdGhlIHRvb2x0aXAgdHJpZ2dlciBzaG91bGQgaGFuZGxlIHRvdWNoIGdlc3R1cmVzLlxuICogU2VlIGBNYXRUb29sdGlwLnRvdWNoR2VzdHVyZXNgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgdHlwZSBUb29sdGlwVG91Y2hHZXN0dXJlcyA9ICdhdXRvJyB8ICdvbicgfCAnb2ZmJztcblxuLyoqIFBvc3NpYmxlIHZpc2liaWxpdHkgc3RhdGVzIG9mIGEgdG9vbHRpcC4gKi9cbmV4cG9ydCB0eXBlIFRvb2x0aXBWaXNpYmlsaXR5ID0gJ2luaXRpYWwnIHwgJ3Zpc2libGUnIHwgJ2hpZGRlbic7XG5cbi8qKiBUaW1lIGluIG1zIHRvIHRocm90dGxlIHJlcG9zaXRpb25pbmcgYWZ0ZXIgc2Nyb2xsIGV2ZW50cy4gKi9cbmV4cG9ydCBjb25zdCBTQ1JPTExfVEhST1RUTEVfTVMgPSAyMDtcblxuLyoqIENTUyBjbGFzcyB0aGF0IHdpbGwgYmUgYXR0YWNoZWQgdG8gdGhlIG92ZXJsYXkgcGFuZWwuICovXG5leHBvcnQgY29uc3QgVE9PTFRJUF9QQU5FTF9DTEFTUyA9ICdtYXQtdG9vbHRpcC1wYW5lbCc7XG5cbi8qKiBPcHRpb25zIHVzZWQgdG8gYmluZCBwYXNzaXZlIGV2ZW50IGxpc3RlbmVycy4gKi9cbmNvbnN0IHBhc3NpdmVMaXN0ZW5lck9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtwYXNzaXZlOiB0cnVlfSk7XG5cbi8qKlxuICogVGltZSBiZXR3ZWVuIHRoZSB1c2VyIHB1dHRpbmcgdGhlIHBvaW50ZXIgb24gYSB0b29sdGlwXG4gKiB0cmlnZ2VyIGFuZCB0aGUgbG9uZyBwcmVzcyBldmVudCBiZWluZyBmaXJlZC5cbiAqL1xuY29uc3QgTE9OR1BSRVNTX0RFTEFZID0gNTAwO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gZXJyb3IgdG8gYmUgdGhyb3duIGlmIHRoZSB1c2VyIHN1cHBsaWVkIGFuIGludmFsaWQgdG9vbHRpcCBwb3NpdGlvbi5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1hdFRvb2x0aXBJbnZhbGlkUG9zaXRpb25FcnJvcihwb3NpdGlvbjogc3RyaW5nKSB7XG4gIHJldHVybiBFcnJvcihgVG9vbHRpcCBwb3NpdGlvbiBcIiR7cG9zaXRpb259XCIgaXMgaW52YWxpZC5gKTtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGRldGVybWluZXMgdGhlIHNjcm9sbCBoYW5kbGluZyB3aGlsZSBhIHRvb2x0aXAgaXMgdmlzaWJsZS4gKi9cbmV4cG9ydCBjb25zdCBNQVRfVE9PTFRJUF9TQ1JPTExfU1RSQVRFR1kgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjwoKSA9PiBTY3JvbGxTdHJhdGVneT4oJ21hdC10b29sdGlwLXNjcm9sbC1zdHJhdGVneScpO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9UT09MVElQX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZKG92ZXJsYXk6IE92ZXJsYXkpOiAoKSA9PiBTY3JvbGxTdHJhdGVneSB7XG4gIHJldHVybiAoKSA9PiBvdmVybGF5LnNjcm9sbFN0cmF0ZWdpZXMucmVwb3NpdGlvbih7c2Nyb2xsVGhyb3R0bGU6IFNDUk9MTF9USFJPVFRMRV9NU30pO1xufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGNvbnN0IE1BVF9UT09MVElQX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZX1BST1ZJREVSID0ge1xuICBwcm92aWRlOiBNQVRfVE9PTFRJUF9TQ1JPTExfU1RSQVRFR1ksXG4gIGRlcHM6IFtPdmVybGF5XSxcbiAgdXNlRmFjdG9yeTogTUFUX1RPT0xUSVBfU0NST0xMX1NUUkFURUdZX0ZBQ1RPUlksXG59O1xuXG4vKiogRGVmYXVsdCBgbWF0VG9vbHRpcGAgb3B0aW9ucyB0aGF0IGNhbiBiZSBvdmVycmlkZGVuLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRUb29sdGlwRGVmYXVsdE9wdGlvbnMge1xuICBzaG93RGVsYXk6IG51bWJlcjtcbiAgaGlkZURlbGF5OiBudW1iZXI7XG4gIHRvdWNoZW5kSGlkZURlbGF5OiBudW1iZXI7XG4gIHRvdWNoR2VzdHVyZXM/OiBUb29sdGlwVG91Y2hHZXN0dXJlcztcbiAgcG9zaXRpb24/OiBUb29sdGlwUG9zaXRpb247XG59XG5cbi8qKiBJbmplY3Rpb24gdG9rZW4gdG8gYmUgdXNlZCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciBgbWF0VG9vbHRpcGAuICovXG5leHBvcnQgY29uc3QgTUFUX1RPT0xUSVBfREVGQVVMVF9PUFRJT05TID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48TWF0VG9vbHRpcERlZmF1bHRPcHRpb25zPignbWF0LXRvb2x0aXAtZGVmYXVsdC1vcHRpb25zJywge1xuICAgICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgICAgZmFjdG9yeTogTUFUX1RPT0xUSVBfREVGQVVMVF9PUFRJT05TX0ZBQ1RPUllcbiAgICB9KTtcblxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmV4cG9ydCBmdW5jdGlvbiBNQVRfVE9PTFRJUF9ERUZBVUxUX09QVElPTlNfRkFDVE9SWSgpOiBNYXRUb29sdGlwRGVmYXVsdE9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIHNob3dEZWxheTogMCxcbiAgICBoaWRlRGVsYXk6IDAsXG4gICAgdG91Y2hlbmRIaWRlRGVsYXk6IDE1MDAsXG4gIH07XG59XG5cbi8qKlxuICogRGlyZWN0aXZlIHRoYXQgYXR0YWNoZXMgYSBtYXRlcmlhbCBkZXNpZ24gdG9vbHRpcCB0byB0aGUgaG9zdCBlbGVtZW50LiBBbmltYXRlcyB0aGUgc2hvd2luZyBhbmRcbiAqIGhpZGluZyBvZiBhIHRvb2x0aXAgcHJvdmlkZWQgcG9zaXRpb24gKGRlZmF1bHRzIHRvIGJlbG93IHRoZSBlbGVtZW50KS5cbiAqXG4gKiBodHRwczovL21hdGVyaWFsLmlvL2Rlc2lnbi9jb21wb25lbnRzL3Rvb2x0aXBzLmh0bWxcbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW21hdFRvb2x0aXBdJyxcbiAgZXhwb3J0QXM6ICdtYXRUb29sdGlwJyxcbn0pXG5leHBvcnQgY2xhc3MgTWF0VG9vbHRpcCBpbXBsZW1lbnRzIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWYgfCBudWxsO1xuICBfdG9vbHRpcEluc3RhbmNlOiBUb29sdGlwQ29tcG9uZW50IHwgbnVsbDtcblxuICBwcml2YXRlIF9wb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUb29sdGlwQ29tcG9uZW50PjtcbiAgcHJpdmF0ZSBfcG9zaXRpb246IFRvb2x0aXBQb3NpdGlvbiA9ICdiZWxvdyc7XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX3Rvb2x0aXBDbGFzczogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICBwcml2YXRlIF9zY3JvbGxTdHJhdGVneTogKCkgPT4gU2Nyb2xsU3RyYXRlZ3k7XG5cbiAgLyoqIEFsbG93cyB0aGUgdXNlciB0byBkZWZpbmUgdGhlIHBvc2l0aW9uIG9mIHRoZSB0b29sdGlwIHJlbGF0aXZlIHRvIHRoZSBwYXJlbnQgZWxlbWVudCAqL1xuICBASW5wdXQoJ21hdFRvb2x0aXBQb3NpdGlvbicpXG4gIGdldCBwb3NpdGlvbigpOiBUb29sdGlwUG9zaXRpb24geyByZXR1cm4gdGhpcy5fcG9zaXRpb247IH1cbiAgc2V0IHBvc2l0aW9uKHZhbHVlOiBUb29sdGlwUG9zaXRpb24pIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX3Bvc2l0aW9uKSB7XG4gICAgICB0aGlzLl9wb3NpdGlvbiA9IHZhbHVlO1xuXG4gICAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xuICAgICAgICB0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgICAgIGlmICh0aGlzLl90b29sdGlwSW5zdGFuY2UpIHtcbiAgICAgICAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UhLnNob3coMCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIERpc2FibGVzIHRoZSBkaXNwbGF5IG9mIHRoZSB0b29sdGlwLiAqL1xuICBASW5wdXQoJ21hdFRvb2x0aXBEaXNhYmxlZCcpXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2Rpc2FibGVkOyB9XG4gIHNldCBkaXNhYmxlZCh2YWx1ZSkge1xuICAgIHRoaXMuX2Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcblxuICAgIC8vIElmIHRvb2x0aXAgaXMgZGlzYWJsZWQsIGhpZGUgaW1tZWRpYXRlbHkuXG4gICAgaWYgKHRoaXMuX2Rpc2FibGVkKSB7XG4gICAgICB0aGlzLmhpZGUoMCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFRoZSBkZWZhdWx0IGRlbGF5IGluIG1zIGJlZm9yZSBzaG93aW5nIHRoZSB0b29sdGlwIGFmdGVyIHNob3cgaXMgY2FsbGVkICovXG4gIEBJbnB1dCgnbWF0VG9vbHRpcFNob3dEZWxheScpIHNob3dEZWxheTogbnVtYmVyID0gdGhpcy5fZGVmYXVsdE9wdGlvbnMuc2hvd0RlbGF5O1xuXG4gIC8qKiBUaGUgZGVmYXVsdCBkZWxheSBpbiBtcyBiZWZvcmUgaGlkaW5nIHRoZSB0b29sdGlwIGFmdGVyIGhpZGUgaXMgY2FsbGVkICovXG4gIEBJbnB1dCgnbWF0VG9vbHRpcEhpZGVEZWxheScpIGhpZGVEZWxheTogbnVtYmVyID0gdGhpcy5fZGVmYXVsdE9wdGlvbnMuaGlkZURlbGF5O1xuXG4gIC8qKlxuICAgKiBIb3cgdG91Y2ggZ2VzdHVyZXMgc2hvdWxkIGJlIGhhbmRsZWQgYnkgdGhlIHRvb2x0aXAuIE9uIHRvdWNoIGRldmljZXMgdGhlIHRvb2x0aXAgZGlyZWN0aXZlXG4gICAqIHVzZXMgYSBsb25nIHByZXNzIGdlc3R1cmUgdG8gc2hvdyBhbmQgaGlkZSwgaG93ZXZlciBpdCBjYW4gY29uZmxpY3Qgd2l0aCB0aGUgbmF0aXZlIGJyb3dzZXJcbiAgICogZ2VzdHVyZXMuIFRvIHdvcmsgYXJvdW5kIHRoZSBjb25mbGljdCwgQW5ndWxhciBNYXRlcmlhbCBkaXNhYmxlcyBuYXRpdmUgZ2VzdHVyZXMgb24gdGhlXG4gICAqIHRyaWdnZXIsIGJ1dCB0aGF0IG1pZ2h0IG5vdCBiZSBkZXNpcmFibGUgb24gcGFydGljdWxhciBlbGVtZW50cyAoZS5nLiBpbnB1dHMgYW5kIGRyYWdnYWJsZVxuICAgKiBlbGVtZW50cykuIFRoZSBkaWZmZXJlbnQgdmFsdWVzIGZvciB0aGlzIG9wdGlvbiBjb25maWd1cmUgdGhlIHRvdWNoIGV2ZW50IGhhbmRsaW5nIGFzIGZvbGxvd3M6XG4gICAqIC0gYGF1dG9gIC0gRW5hYmxlcyB0b3VjaCBnZXN0dXJlcyBmb3IgYWxsIGVsZW1lbnRzLCBidXQgdHJpZXMgdG8gYXZvaWQgY29uZmxpY3RzIHdpdGggbmF0aXZlXG4gICAqICAgYnJvd3NlciBnZXN0dXJlcyBvbiBwYXJ0aWN1bGFyIGVsZW1lbnRzLiBJbiBwYXJ0aWN1bGFyLCBpdCBhbGxvd3MgdGV4dCBzZWxlY3Rpb24gb24gaW5wdXRzXG4gICAqICAgYW5kIHRleHRhcmVhcywgYW5kIHByZXNlcnZlcyB0aGUgbmF0aXZlIGJyb3dzZXIgZHJhZ2dpbmcgb24gZWxlbWVudHMgbWFya2VkIGFzIGBkcmFnZ2FibGVgLlxuICAgKiAtIGBvbmAgLSBFbmFibGVzIHRvdWNoIGdlc3R1cmVzIGZvciBhbGwgZWxlbWVudHMgYW5kIGRpc2FibGVzIG5hdGl2ZVxuICAgKiAgIGJyb3dzZXIgZ2VzdHVyZXMgd2l0aCBubyBleGNlcHRpb25zLlxuICAgKiAtIGBvZmZgIC0gRGlzYWJsZXMgdG91Y2ggZ2VzdHVyZXMuIE5vdGUgdGhhdCB0aGlzIHdpbGwgcHJldmVudCB0aGUgdG9vbHRpcCBmcm9tXG4gICAqICAgc2hvd2luZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgKi9cbiAgQElucHV0KCdtYXRUb29sdGlwVG91Y2hHZXN0dXJlcycpIHRvdWNoR2VzdHVyZXM6IFRvb2x0aXBUb3VjaEdlc3R1cmVzID0gJ2F1dG8nO1xuXG4gIC8qKiBUaGUgbWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlIHRvb2x0aXAgKi9cbiAgQElucHV0KCdtYXRUb29sdGlwJylcbiAgZ2V0IG1lc3NhZ2UoKSB7IHJldHVybiB0aGlzLl9tZXNzYWdlOyB9XG4gIHNldCBtZXNzYWdlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVyLnJlbW92ZURlc2NyaXB0aW9uKHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgdGhpcy5fbWVzc2FnZSk7XG5cbiAgICAvLyBJZiB0aGUgbWVzc2FnZSBpcyBub3QgYSBzdHJpbmcgKGUuZy4gbnVtYmVyKSwgY29udmVydCBpdCB0byBhIHN0cmluZyBhbmQgdHJpbSBpdC5cbiAgICB0aGlzLl9tZXNzYWdlID0gdmFsdWUgIT0gbnVsbCA/IGAke3ZhbHVlfWAudHJpbSgpIDogJyc7XG5cbiAgICBpZiAoIXRoaXMuX21lc3NhZ2UgJiYgdGhpcy5faXNUb29sdGlwVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLmhpZGUoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVRvb2x0aXBNZXNzYWdlKCk7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAvLyBUaGUgYEFyaWFEZXNjcmliZXJgIGhhcyBzb21lIGZ1bmN0aW9uYWxpdHkgdGhhdCBhdm9pZHMgYWRkaW5nIGEgZGVzY3JpcHRpb24gaWYgaXQncyB0aGVcbiAgICAgICAgLy8gc2FtZSBhcyB0aGUgYGFyaWEtbGFiZWxgIG9mIGFuIGVsZW1lbnQsIGhvd2V2ZXIgd2UgY2FuJ3Qga25vdyB3aGV0aGVyIHRoZSB0b29sdGlwIHRyaWdnZXJcbiAgICAgICAgLy8gaGFzIGEgZGF0YS1ib3VuZCBgYXJpYS1sYWJlbGAgb3Igd2hlbiBpdCdsbCBiZSBzZXQgZm9yIHRoZSBmaXJzdCB0aW1lLiBXZSBjYW4gYXZvaWQgdGhlXG4gICAgICAgIC8vIGlzc3VlIGJ5IGRlZmVycmluZyB0aGUgZGVzY3JpcHRpb24gYnkgYSB0aWNrIHNvIEFuZ3VsYXIgaGFzIHRpbWUgdG8gc2V0IHRoZSBgYXJpYS1sYWJlbGAuXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2FyaWFEZXNjcmliZXIuZGVzY3JpYmUodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLm1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9tZXNzYWdlID0gJyc7XG5cbiAgLyoqIENsYXNzZXMgdG8gYmUgcGFzc2VkIHRvIHRoZSB0b29sdGlwLiBTdXBwb3J0cyB0aGUgc2FtZSBzeW50YXggYXMgYG5nQ2xhc3NgLiAqL1xuICBASW5wdXQoJ21hdFRvb2x0aXBDbGFzcycpXG4gIGdldCB0b29sdGlwQ2xhc3MoKSB7IHJldHVybiB0aGlzLl90b29sdGlwQ2xhc3M7IH1cbiAgc2V0IHRvb2x0aXBDbGFzcyh2YWx1ZTogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy5fdG9vbHRpcENsYXNzID0gdmFsdWU7XG4gICAgaWYgKHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSkge1xuICAgICAgdGhpcy5fc2V0VG9vbHRpcENsYXNzKHRoaXMuX3Rvb2x0aXBDbGFzcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIE1hbnVhbGx5LWJvdW5kIHBhc3NpdmUgZXZlbnQgbGlzdGVuZXJzLiAqL1xuICBwcml2YXRlIF9wYXNzaXZlTGlzdGVuZXJzID0gbmV3IE1hcDxzdHJpbmcsIEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3Q+KCk7XG5cbiAgLyoqIFRpbWVyIHN0YXJ0ZWQgYXQgdGhlIGxhc3QgYHRvdWNoc3RhcnRgIGV2ZW50LiAqL1xuICBwcml2YXRlIF90b3VjaHN0YXJ0VGltZW91dDogbnVtYmVyO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaXMgZGVzdHJveWVkLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX292ZXJsYXk6IE92ZXJsYXksXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfc2Nyb2xsRGlzcGF0Y2hlcjogU2Nyb2xsRGlzcGF0Y2hlcixcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcbiAgICBwcml2YXRlIF9hcmlhRGVzY3JpYmVyOiBBcmlhRGVzY3JpYmVyLFxuICAgIHByaXZhdGUgX2ZvY3VzTW9uaXRvcjogRm9jdXNNb25pdG9yLFxuICAgIEBJbmplY3QoTUFUX1RPT0xUSVBfU0NST0xMX1NUUkFURUdZKSBzY3JvbGxTdHJhdGVneTogYW55LFxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRfVE9PTFRJUF9ERUZBVUxUX09QVElPTlMpXG4gICAgICBwcml2YXRlIF9kZWZhdWx0T3B0aW9uczogTWF0VG9vbHRpcERlZmF1bHRPcHRpb25zLFxuICAgICAgLyoqXG4gICAgICAgKiBAZGVwcmVjYXRlZCBfaGFtbWVyTG9hZGVyIHBhcmFtZXRlciB0byBiZSByZW1vdmVkLlxuICAgICAgICogQGJyZWFraW5nLWNoYW5nZSA5LjAuMFxuICAgICAgICovXG4gICAgICAvLyBOb3RlIHRoYXQgd2UgbmVlZCB0byBnaXZlIEFuZ3VsYXIgc29tZXRoaW5nIHRvIGluamVjdCBoZXJlIHNvIGl0IGRvZXNuJ3QgdGhyb3cuXG4gICAgICBASW5qZWN0KEVsZW1lbnRSZWYpIF9oYW1tZXJMb2FkZXI/OiBhbnkpIHtcblxuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5ID0gc2Nyb2xsU3RyYXRlZ3k7XG5cbiAgICBpZiAoX2RlZmF1bHRPcHRpb25zKSB7XG4gICAgICBpZiAoX2RlZmF1bHRPcHRpb25zLnBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBfZGVmYXVsdE9wdGlvbnMucG9zaXRpb247XG4gICAgICB9XG5cbiAgICAgIGlmIChfZGVmYXVsdE9wdGlvbnMudG91Y2hHZXN0dXJlcykge1xuICAgICAgICB0aGlzLnRvdWNoR2VzdHVyZXMgPSBfZGVmYXVsdE9wdGlvbnMudG91Y2hHZXN0dXJlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfZm9jdXNNb25pdG9yLm1vbml0b3IoX2VsZW1lbnRSZWYpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUob3JpZ2luID0+IHtcbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoZSBmb2N1cyBtb25pdG9yIHJ1bnMgb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lLlxuICAgICAgICBpZiAoIW9yaWdpbikge1xuICAgICAgICAgIF9uZ1pvbmUucnVuKCgpID0+IHRoaXMuaGlkZSgwKSk7XG4gICAgICAgIH0gZWxzZSBpZiAob3JpZ2luID09PSAna2V5Ym9hcmQnKSB7XG4gICAgICAgICAgX25nWm9uZS5ydW4oKCkgPT4gdGhpcy5zaG93KCkpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBfbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2hhbmRsZUtleWRvd24pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHVwIHN0eWxpbmctc3BlY2lmaWMgdGhpbmdzXG4gICAqL1xuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBUaGlzIG5lZWRzIHRvIGhhcHBlbiBpbiBgbmdPbkluaXRgIHNvIHRoZSBpbml0aWFsIHZhbHVlcyBmb3IgYWxsIGlucHV0cyBoYXZlIGJlZW4gc2V0LlxuICAgIHRoaXMuX3NldHVwUG9pbnRlckV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2UgdGhlIHRvb2x0aXAgd2hlbiBkZXN0cm95ZWQuXG4gICAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RvdWNoc3RhcnRUaW1lb3V0KTtcblxuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ2xlYW4gdXAgdGhlIGV2ZW50IGxpc3RlbmVycyBzZXQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgbmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5faGFuZGxlS2V5ZG93bik7XG4gICAgdGhpcy5fcGFzc2l2ZUxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lciwgZXZlbnQpID0+IHtcbiAgICAgIG5hdGl2ZUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIsIHBhc3NpdmVMaXN0ZW5lck9wdGlvbnMpO1xuICAgIH0pO1xuICAgIHRoaXMuX3Bhc3NpdmVMaXN0ZW5lcnMuY2xlYXIoKTtcblxuICAgIHRoaXMuX2Rlc3Ryb3llZC5uZXh0KCk7XG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XG5cbiAgICB0aGlzLl9hcmlhRGVzY3JpYmVyLnJlbW92ZURlc2NyaXB0aW9uKG5hdGl2ZUVsZW1lbnQsIHRoaXMubWVzc2FnZSk7XG4gICAgdGhpcy5fZm9jdXNNb25pdG9yLnN0b3BNb25pdG9yaW5nKG5hdGl2ZUVsZW1lbnQpO1xuICB9XG5cbiAgLyoqIFNob3dzIHRoZSB0b29sdGlwIGFmdGVyIHRoZSBkZWxheSBpbiBtcywgZGVmYXVsdHMgdG8gdG9vbHRpcC1kZWxheS1zaG93IG9yIDBtcyBpZiBubyBpbnB1dCAqL1xuICBzaG93KGRlbGF5OiBudW1iZXIgPSB0aGlzLnNob3dEZWxheSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRpc2FibGVkIHx8ICF0aGlzLm1lc3NhZ2UgfHwgKHRoaXMuX2lzVG9vbHRpcFZpc2libGUoKSAmJlxuICAgICAgIXRoaXMuX3Rvb2x0aXBJbnN0YW5jZSEuX3Nob3dUaW1lb3V0SWQgJiYgIXRoaXMuX3Rvb2x0aXBJbnN0YW5jZSEuX2hpZGVUaW1lb3V0SWQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvdmVybGF5UmVmID0gdGhpcy5fY3JlYXRlT3ZlcmxheSgpO1xuXG4gICAgdGhpcy5fZGV0YWNoKCk7XG4gICAgdGhpcy5fcG9ydGFsID0gdGhpcy5fcG9ydGFsIHx8IG5ldyBDb21wb25lbnRQb3J0YWwoVG9vbHRpcENvbXBvbmVudCwgdGhpcy5fdmlld0NvbnRhaW5lclJlZik7XG4gICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlID0gb3ZlcmxheVJlZi5hdHRhY2godGhpcy5fcG9ydGFsKS5pbnN0YW5jZTtcbiAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UuYWZ0ZXJIaWRkZW4oKVxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2RldGFjaCgpKTtcbiAgICB0aGlzLl9zZXRUb29sdGlwQ2xhc3ModGhpcy5fdG9vbHRpcENsYXNzKTtcbiAgICB0aGlzLl91cGRhdGVUb29sdGlwTWVzc2FnZSgpO1xuICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSEuc2hvdyhkZWxheSk7XG4gIH1cblxuICAvKiogSGlkZXMgdGhlIHRvb2x0aXAgYWZ0ZXIgdGhlIGRlbGF5IGluIG1zLCBkZWZhdWx0cyB0byB0b29sdGlwLWRlbGF5LWhpZGUgb3IgMG1zIGlmIG5vIGlucHV0ICovXG4gIGhpZGUoZGVsYXk6IG51bWJlciA9IHRoaXMuaGlkZURlbGF5KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSkge1xuICAgICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlLmhpZGUoZGVsYXkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTaG93cy9oaWRlcyB0aGUgdG9vbHRpcCAqL1xuICB0b2dnbGUoKTogdm9pZCB7XG4gICAgdGhpcy5faXNUb29sdGlwVmlzaWJsZSgpID8gdGhpcy5oaWRlKCkgOiB0aGlzLnNob3coKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRydWUgaWYgdGhlIHRvb2x0aXAgaXMgY3VycmVudGx5IHZpc2libGUgdG8gdGhlIHVzZXIgKi9cbiAgX2lzVG9vbHRpcFZpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5fdG9vbHRpcEluc3RhbmNlICYmIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZS5pc1Zpc2libGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBrZXlkb3duIGV2ZW50cyBvbiB0aGUgaG9zdCBlbGVtZW50LlxuICAgKiBOZWVkcyB0byBiZSBhbiBhcnJvdyBmdW5jdGlvbiBzbyB0aGF0IHdlIGNhbiB1c2UgaXQgaW4gYWRkRXZlbnRMaXN0ZW5lci5cbiAgICovXG4gIHByaXZhdGUgX2hhbmRsZUtleWRvd24gPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICBpZiAodGhpcy5faXNUb29sdGlwVmlzaWJsZSgpICYmIGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSAmJiAhaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMuaGlkZSgwKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENyZWF0ZSB0aGUgb3ZlcmxheSBjb25maWcgYW5kIHBvc2l0aW9uIHN0cmF0ZWd5ICovXG4gIHByaXZhdGUgX2NyZWF0ZU92ZXJsYXkoKTogT3ZlcmxheVJlZiB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmO1xuICAgIH1cblxuICAgIGNvbnN0IHNjcm9sbGFibGVBbmNlc3RvcnMgPVxuICAgICAgICB0aGlzLl9zY3JvbGxEaXNwYXRjaGVyLmdldEFuY2VzdG9yU2Nyb2xsQ29udGFpbmVycyh0aGlzLl9lbGVtZW50UmVmKTtcblxuICAgIC8vIENyZWF0ZSBjb25uZWN0ZWQgcG9zaXRpb24gc3RyYXRlZ3kgdGhhdCBsaXN0ZW5zIGZvciBzY3JvbGwgZXZlbnRzIHRvIHJlcG9zaXRpb24uXG4gICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLl9vdmVybGF5LnBvc2l0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAuZmxleGlibGVDb25uZWN0ZWRUbyh0aGlzLl9lbGVtZW50UmVmKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC53aXRoVHJhbnNmb3JtT3JpZ2luT24oJy5tYXQtdG9vbHRpcCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLndpdGhGbGV4aWJsZURpbWVuc2lvbnMoZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLndpdGhWaWV3cG9ydE1hcmdpbig4KVxuICAgICAgICAgICAgICAgICAgICAgICAgIC53aXRoU2Nyb2xsYWJsZUNvbnRhaW5lcnMoc2Nyb2xsYWJsZUFuY2VzdG9ycyk7XG5cbiAgICBzdHJhdGVneS5wb3NpdGlvbkNoYW5nZXMucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSkuc3Vic2NyaWJlKGNoYW5nZSA9PiB7XG4gICAgICBpZiAodGhpcy5fdG9vbHRpcEluc3RhbmNlKSB7XG4gICAgICAgIGlmIChjaGFuZ2Uuc2Nyb2xsYWJsZVZpZXdQcm9wZXJ0aWVzLmlzT3ZlcmxheUNsaXBwZWQgJiYgdGhpcy5fdG9vbHRpcEluc3RhbmNlLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgICAgLy8gQWZ0ZXIgcG9zaXRpb24gY2hhbmdlcyBvY2N1ciBhbmQgdGhlIG92ZXJsYXkgaXMgY2xpcHBlZCBieVxuICAgICAgICAgIC8vIGEgcGFyZW50IHNjcm9sbGFibGUgdGhlbiBjbG9zZSB0aGUgdG9vbHRpcC5cbiAgICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMuaGlkZSgwKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX292ZXJsYXlSZWYgPSB0aGlzLl9vdmVybGF5LmNyZWF0ZSh7XG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcixcbiAgICAgIHBvc2l0aW9uU3RyYXRlZ3k6IHN0cmF0ZWd5LFxuICAgICAgcGFuZWxDbGFzczogVE9PTFRJUF9QQU5FTF9DTEFTUyxcbiAgICAgIHNjcm9sbFN0cmF0ZWd5OiB0aGlzLl9zY3JvbGxTdHJhdGVneSgpXG4gICAgfSk7XG5cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgdGhpcy5fb3ZlcmxheVJlZi5kZXRhY2htZW50cygpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fZGV0YWNoKCkpO1xuXG4gICAgcmV0dXJuIHRoaXMuX292ZXJsYXlSZWY7XG4gIH1cblxuICAvKiogRGV0YWNoZXMgdGhlIGN1cnJlbnRseS1hdHRhY2hlZCB0b29sdGlwLiAqL1xuICBwcml2YXRlIF9kZXRhY2goKSB7XG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYgJiYgdGhpcy5fb3ZlcmxheVJlZi5oYXNBdHRhY2hlZCgpKSB7XG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRldGFjaCgpO1xuICAgIH1cblxuICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZSA9IG51bGw7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnQgdG9vbHRpcC4gKi9cbiAgcHJpdmF0ZSBfdXBkYXRlUG9zaXRpb24oKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPVxuICAgICAgICB0aGlzLl9vdmVybGF5UmVmIS5nZXRDb25maWcoKS5wb3NpdGlvblN0cmF0ZWd5IGFzIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneTtcbiAgICBjb25zdCBvcmlnaW4gPSB0aGlzLl9nZXRPcmlnaW4oKTtcbiAgICBjb25zdCBvdmVybGF5ID0gdGhpcy5fZ2V0T3ZlcmxheVBvc2l0aW9uKCk7XG5cbiAgICBwb3NpdGlvbi53aXRoUG9zaXRpb25zKFtcbiAgICAgIHsuLi5vcmlnaW4ubWFpbiwgLi4ub3ZlcmxheS5tYWlufSxcbiAgICAgIHsuLi5vcmlnaW4uZmFsbGJhY2ssIC4uLm92ZXJsYXkuZmFsbGJhY2t9XG4gICAgXSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3JpZ2luIHBvc2l0aW9uIGFuZCBhIGZhbGxiYWNrIHBvc2l0aW9uIGJhc2VkIG9uIHRoZSB1c2VyJ3MgcG9zaXRpb24gcHJlZmVyZW5jZS5cbiAgICogVGhlIGZhbGxiYWNrIHBvc2l0aW9uIGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBvcmlnaW4gKGUuZy4gYCdiZWxvdycgLT4gJ2Fib3ZlJ2ApLlxuICAgKi9cbiAgX2dldE9yaWdpbigpOiB7bWFpbjogT3JpZ2luQ29ubmVjdGlvblBvc2l0aW9uLCBmYWxsYmFjazogT3JpZ2luQ29ubmVjdGlvblBvc2l0aW9ufSB7XG4gICAgY29uc3QgaXNMdHIgPSAhdGhpcy5fZGlyIHx8IHRoaXMuX2Rpci52YWx1ZSA9PSAnbHRyJztcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb247XG4gICAgbGV0IG9yaWdpblBvc2l0aW9uOiBPcmlnaW5Db25uZWN0aW9uUG9zaXRpb247XG5cbiAgICBpZiAocG9zaXRpb24gPT0gJ2Fib3ZlJyB8fCBwb3NpdGlvbiA9PSAnYmVsb3cnKSB7XG4gICAgICBvcmlnaW5Qb3NpdGlvbiA9IHtvcmlnaW5YOiAnY2VudGVyJywgb3JpZ2luWTogcG9zaXRpb24gPT0gJ2Fib3ZlJyA/ICd0b3AnIDogJ2JvdHRvbSd9O1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBwb3NpdGlvbiA9PSAnYmVmb3JlJyB8fFxuICAgICAgKHBvc2l0aW9uID09ICdsZWZ0JyAmJiBpc0x0cikgfHxcbiAgICAgIChwb3NpdGlvbiA9PSAncmlnaHQnICYmICFpc0x0cikpIHtcbiAgICAgIG9yaWdpblBvc2l0aW9uID0ge29yaWdpblg6ICdzdGFydCcsIG9yaWdpblk6ICdjZW50ZXInfTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcG9zaXRpb24gPT0gJ2FmdGVyJyB8fFxuICAgICAgKHBvc2l0aW9uID09ICdyaWdodCcgJiYgaXNMdHIpIHx8XG4gICAgICAocG9zaXRpb24gPT0gJ2xlZnQnICYmICFpc0x0cikpIHtcbiAgICAgIG9yaWdpblBvc2l0aW9uID0ge29yaWdpblg6ICdlbmQnLCBvcmlnaW5ZOiAnY2VudGVyJ307XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGdldE1hdFRvb2x0aXBJbnZhbGlkUG9zaXRpb25FcnJvcihwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgY29uc3Qge3gsIHl9ID0gdGhpcy5faW52ZXJ0UG9zaXRpb24ob3JpZ2luUG9zaXRpb24ub3JpZ2luWCwgb3JpZ2luUG9zaXRpb24ub3JpZ2luWSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWFpbjogb3JpZ2luUG9zaXRpb24sXG4gICAgICBmYWxsYmFjazoge29yaWdpblg6IHgsIG9yaWdpblk6IHl9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBvdmVybGF5IHBvc2l0aW9uIGFuZCBhIGZhbGxiYWNrIHBvc2l0aW9uIGJhc2VkIG9uIHRoZSB1c2VyJ3MgcHJlZmVyZW5jZSAqL1xuICBfZ2V0T3ZlcmxheVBvc2l0aW9uKCk6IHttYWluOiBPdmVybGF5Q29ubmVjdGlvblBvc2l0aW9uLCBmYWxsYmFjazogT3ZlcmxheUNvbm5lY3Rpb25Qb3NpdGlvbn0ge1xuICAgIGNvbnN0IGlzTHRyID0gIXRoaXMuX2RpciB8fCB0aGlzLl9kaXIudmFsdWUgPT0gJ2x0cic7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uO1xuICAgIGxldCBvdmVybGF5UG9zaXRpb246IE92ZXJsYXlDb25uZWN0aW9uUG9zaXRpb247XG5cbiAgICBpZiAocG9zaXRpb24gPT0gJ2Fib3ZlJykge1xuICAgICAgb3ZlcmxheVBvc2l0aW9uID0ge292ZXJsYXlYOiAnY2VudGVyJywgb3ZlcmxheVk6ICdib3R0b20nfTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09ICdiZWxvdycpIHtcbiAgICAgIG92ZXJsYXlQb3NpdGlvbiA9IHtvdmVybGF5WDogJ2NlbnRlcicsIG92ZXJsYXlZOiAndG9wJ307XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHBvc2l0aW9uID09ICdiZWZvcmUnIHx8XG4gICAgICAocG9zaXRpb24gPT0gJ2xlZnQnICYmIGlzTHRyKSB8fFxuICAgICAgKHBvc2l0aW9uID09ICdyaWdodCcgJiYgIWlzTHRyKSkge1xuICAgICAgb3ZlcmxheVBvc2l0aW9uID0ge292ZXJsYXlYOiAnZW5kJywgb3ZlcmxheVk6ICdjZW50ZXInfTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcG9zaXRpb24gPT0gJ2FmdGVyJyB8fFxuICAgICAgKHBvc2l0aW9uID09ICdyaWdodCcgJiYgaXNMdHIpIHx8XG4gICAgICAocG9zaXRpb24gPT0gJ2xlZnQnICYmICFpc0x0cikpIHtcbiAgICAgIG92ZXJsYXlQb3NpdGlvbiA9IHtvdmVybGF5WDogJ3N0YXJ0Jywgb3ZlcmxheVk6ICdjZW50ZXInfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZ2V0TWF0VG9vbHRpcEludmFsaWRQb3NpdGlvbkVycm9yKHBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBjb25zdCB7eCwgeX0gPSB0aGlzLl9pbnZlcnRQb3NpdGlvbihvdmVybGF5UG9zaXRpb24ub3ZlcmxheVgsIG92ZXJsYXlQb3NpdGlvbi5vdmVybGF5WSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWFpbjogb3ZlcmxheVBvc2l0aW9uLFxuICAgICAgZmFsbGJhY2s6IHtvdmVybGF5WDogeCwgb3ZlcmxheVk6IHl9XG4gICAgfTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSB0b29sdGlwIG1lc3NhZ2UgYW5kIHJlcG9zaXRpb25zIHRoZSBvdmVybGF5IGFjY29yZGluZyB0byB0aGUgbmV3IG1lc3NhZ2UgbGVuZ3RoICovXG4gIHByaXZhdGUgX3VwZGF0ZVRvb2x0aXBNZXNzYWdlKCkge1xuICAgIC8vIE11c3Qgd2FpdCBmb3IgdGhlIG1lc3NhZ2UgdG8gYmUgcGFpbnRlZCB0byB0aGUgdG9vbHRpcCBzbyB0aGF0IHRoZSBvdmVybGF5IGNhbiBwcm9wZXJseVxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgY29ycmVjdCBwb3NpdGlvbmluZyBiYXNlZCBvbiB0aGUgc2l6ZSBvZiB0aGUgdGV4dC5cbiAgICBpZiAodGhpcy5fdG9vbHRpcEluc3RhbmNlKSB7XG4gICAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UubWVzc2FnZSA9IHRoaXMubWVzc2FnZTtcbiAgICAgIHRoaXMuX3Rvb2x0aXBJbnN0YW5jZS5fbWFya0ZvckNoZWNrKCk7XG5cbiAgICAgIHRoaXMuX25nWm9uZS5vbk1pY3JvdGFza0VtcHR5LmFzT2JzZXJ2YWJsZSgpLnBpcGUoXG4gICAgICAgIHRha2UoMSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpXG4gICAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl90b29sdGlwSW5zdGFuY2UpIHtcbiAgICAgICAgICB0aGlzLl9vdmVybGF5UmVmIS51cGRhdGVQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgdG9vbHRpcCBjbGFzcyAqL1xuICBwcml2YXRlIF9zZXRUb29sdGlwQ2xhc3ModG9vbHRpcENsYXNzOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICBpZiAodGhpcy5fdG9vbHRpcEluc3RhbmNlKSB7XG4gICAgICB0aGlzLl90b29sdGlwSW5zdGFuY2UudG9vbHRpcENsYXNzID0gdG9vbHRpcENsYXNzO1xuICAgICAgdGhpcy5fdG9vbHRpcEluc3RhbmNlLl9tYXJrRm9yQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICAvKiogSW52ZXJ0cyBhbiBvdmVybGF5IHBvc2l0aW9uLiAqL1xuICBwcml2YXRlIF9pbnZlcnRQb3NpdGlvbih4OiBIb3Jpem9udGFsQ29ubmVjdGlvblBvcywgeTogVmVydGljYWxDb25uZWN0aW9uUG9zKSB7XG4gICAgaWYgKHRoaXMucG9zaXRpb24gPT09ICdhYm92ZScgfHwgdGhpcy5wb3NpdGlvbiA9PT0gJ2JlbG93Jykge1xuICAgICAgaWYgKHkgPT09ICd0b3AnKSB7XG4gICAgICAgIHkgPSAnYm90dG9tJztcbiAgICAgIH0gZWxzZSBpZiAoeSA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgeSA9ICd0b3AnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoeCA9PT0gJ2VuZCcpIHtcbiAgICAgICAgeCA9ICdzdGFydCc7XG4gICAgICB9IGVsc2UgaWYgKHggPT09ICdzdGFydCcpIHtcbiAgICAgICAgeCA9ICdlbmQnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7eCwgeX07XG4gIH1cblxuICAvKiogQmluZHMgdGhlIHBvaW50ZXIgZXZlbnRzIHRvIHRoZSB0b29sdGlwIHRyaWdnZXIuICovXG4gIHByaXZhdGUgX3NldHVwUG9pbnRlckV2ZW50cygpIHtcbiAgICAvLyBUaGUgbW91c2UgZXZlbnRzIHNob3VsZG4ndCBiZSBib3VuZCBvbiBtb2JpbGUgZGV2aWNlcywgYmVjYXVzZSB0aGV5IGNhbiBwcmV2ZW50IHRoZVxuICAgIC8vIGZpcnN0IHRhcCBmcm9tIGZpcmluZyBpdHMgY2xpY2sgZXZlbnQgb3IgY2FuIGNhdXNlIHRoZSB0b29sdGlwIHRvIG9wZW4gZm9yIGNsaWNrcy5cbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLklPUyAmJiAhdGhpcy5fcGxhdGZvcm0uQU5EUk9JRCkge1xuICAgICAgdGhpcy5fcGFzc2l2ZUxpc3RlbmVyc1xuICAgICAgICAuc2V0KCdtb3VzZWVudGVyJywgKCkgPT4gdGhpcy5zaG93KCkpXG4gICAgICAgIC5zZXQoJ21vdXNlbGVhdmUnLCAoKSA9PiB0aGlzLmhpZGUoKSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLnRvdWNoR2VzdHVyZXMgIT09ICdvZmYnKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlTmF0aXZlR2VzdHVyZXNJZk5lY2Vzc2FyeSgpO1xuICAgICAgY29uc3QgdG91Y2hlbmRMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RvdWNoc3RhcnRUaW1lb3V0KTtcbiAgICAgICAgdGhpcy5oaWRlKHRoaXMuX2RlZmF1bHRPcHRpb25zLnRvdWNoZW5kSGlkZURlbGF5KTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuX3Bhc3NpdmVMaXN0ZW5lcnNcbiAgICAgICAgLnNldCgndG91Y2hlbmQnLCB0b3VjaGVuZExpc3RlbmVyKVxuICAgICAgICAuc2V0KCd0b3VjaGNhbmNlbCcsIHRvdWNoZW5kTGlzdGVuZXIpXG4gICAgICAgIC5zZXQoJ3RvdWNoc3RhcnQnLCAoKSA9PiB7XG4gICAgICAgICAgLy8gTm90ZSB0aGF0IGl0J3MgaW1wb3J0YW50IHRoYXQgd2UgZG9uJ3QgYHByZXZlbnREZWZhdWx0YCBoZXJlLFxuICAgICAgICAgIC8vIGJlY2F1c2UgaXQgY2FuIHByZXZlbnQgY2xpY2sgZXZlbnRzIGZyb20gZmlyaW5nIG9uIHRoZSBlbGVtZW50LlxuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90b3VjaHN0YXJ0VGltZW91dCk7XG4gICAgICAgICAgdGhpcy5fdG91Y2hzdGFydFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2hvdygpLCBMT05HUFJFU1NfREVMQVkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9wYXNzaXZlTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBldmVudCkgPT4ge1xuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyLCBwYXNzaXZlTGlzdGVuZXJPcHRpb25zKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBEaXNhYmxlcyB0aGUgbmF0aXZlIGJyb3dzZXIgZ2VzdHVyZXMsIGJhc2VkIG9uIGhvdyB0aGUgdG9vbHRpcCBoYXMgYmVlbiBjb25maWd1cmVkLiAqL1xuICBwcml2YXRlIF9kaXNhYmxlTmF0aXZlR2VzdHVyZXNJZk5lY2Vzc2FyeSgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IHN0eWxlID0gZWxlbWVudC5zdHlsZTtcbiAgICBjb25zdCBnZXN0dXJlcyA9IHRoaXMudG91Y2hHZXN0dXJlcztcblxuICAgIGlmIChnZXN0dXJlcyAhPT0gJ29mZicpIHtcbiAgICAgIC8vIElmIGdlc3R1cmVzIGFyZSBzZXQgdG8gYGF1dG9gLCB3ZSBkb24ndCBkaXNhYmxlIHRleHQgc2VsZWN0aW9uIG9uIGlucHV0cyBhbmRcbiAgICAgIC8vIHRleHRhcmVhcywgYmVjYXVzZSBpdCBwcmV2ZW50cyB0aGUgdXNlciBmcm9tIHR5cGluZyBpbnRvIHRoZW0gb24gaU9TIFNhZmFyaS5cbiAgICAgIGlmIChnZXN0dXJlcyA9PT0gJ29uJyB8fCAoZWxlbWVudC5ub2RlTmFtZSAhPT0gJ0lOUFVUJyAmJiBlbGVtZW50Lm5vZGVOYW1lICE9PSAnVEVYVEFSRUEnKSkge1xuICAgICAgICBzdHlsZS51c2VyU2VsZWN0ID0gc3R5bGUubXNVc2VyU2VsZWN0ID0gc3R5bGUud2Via2l0VXNlclNlbGVjdCA9XG4gICAgICAgICAgICAoc3R5bGUgYXMgYW55KS5Nb3pVc2VyU2VsZWN0ID0gJ25vbmUnO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSBoYXZlIGBhdXRvYCBnZXN0dXJlcyBhbmQgdGhlIGVsZW1lbnQgdXNlcyBuYXRpdmUgSFRNTCBkcmFnZ2luZyxcbiAgICAgIC8vIHdlIGRvbid0IHNldCBgLXdlYmtpdC11c2VyLWRyYWdgIGJlY2F1c2UgaXQgcHJldmVudHMgdGhlIG5hdGl2ZSBiZWhhdmlvci5cbiAgICAgIGlmIChnZXN0dXJlcyA9PT0gJ29uJyB8fCAhZWxlbWVudC5kcmFnZ2FibGUpIHtcbiAgICAgICAgKHN0eWxlIGFzIGFueSkud2Via2l0VXNlckRyYWcgPSAnbm9uZSc7XG4gICAgICB9XG5cbiAgICAgIHN0eWxlLnRvdWNoQWN0aW9uID0gJ25vbmUnO1xuICAgICAgc3R5bGUud2Via2l0VGFwSGlnaGxpZ2h0Q29sb3IgPSAndHJhbnNwYXJlbnQnO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEludGVybmFsIGNvbXBvbmVudCB0aGF0IHdyYXBzIHRoZSB0b29sdGlwJ3MgY29udGVudC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQENvbXBvbmVudCh7XG4gIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gIHNlbGVjdG9yOiAnbWF0LXRvb2x0aXAtY29tcG9uZW50JyxcbiAgdGVtcGxhdGVVcmw6ICd0b29sdGlwLmh0bWwnLFxuICBzdHlsZVVybHM6IFsndG9vbHRpcC5jc3MnXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gIGFuaW1hdGlvbnM6IFttYXRUb29sdGlwQW5pbWF0aW9ucy50b29sdGlwU3RhdGVdLFxuICBob3N0OiB7XG4gICAgLy8gRm9yY2VzIHRoZSBlbGVtZW50IHRvIGhhdmUgYSBsYXlvdXQgaW4gSUUgYW5kIEVkZ2UuIFRoaXMgZml4ZXMgaXNzdWVzIHdoZXJlIHRoZSBlbGVtZW50XG4gICAgLy8gd29uJ3QgYmUgcmVuZGVyZWQgaWYgdGhlIGFuaW1hdGlvbnMgYXJlIGRpc2FibGVkIG9yIHRoZXJlIGlzIG5vIHdlYiBhbmltYXRpb25zIHBvbHlmaWxsLlxuICAgICdbc3R5bGUuem9vbV0nOiAnX3Zpc2liaWxpdHkgPT09IFwidmlzaWJsZVwiID8gMSA6IG51bGwnLFxuICAgICcoYm9keTpjbGljayknOiAndGhpcy5faGFuZGxlQm9keUludGVyYWN0aW9uKCknLFxuICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJyxcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBUb29sdGlwQ29tcG9uZW50IGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgLyoqIE1lc3NhZ2UgdG8gZGlzcGxheSBpbiB0aGUgdG9vbHRpcCAqL1xuICBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgLyoqIENsYXNzZXMgdG8gYmUgYWRkZWQgdG8gdGhlIHRvb2x0aXAuIFN1cHBvcnRzIHRoZSBzYW1lIHN5bnRheCBhcyBgbmdDbGFzc2AuICovXG4gIHRvb2x0aXBDbGFzczogc3RyaW5nfHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIC8qKiBUaGUgdGltZW91dCBJRCBvZiBhbnkgY3VycmVudCB0aW1lciBzZXQgdG8gc2hvdyB0aGUgdG9vbHRpcCAqL1xuICBfc2hvd1RpbWVvdXRJZDogbnVtYmVyIHwgbnVsbDtcblxuICAvKiogVGhlIHRpbWVvdXQgSUQgb2YgYW55IGN1cnJlbnQgdGltZXIgc2V0IHRvIGhpZGUgdGhlIHRvb2x0aXAgKi9cbiAgX2hpZGVUaW1lb3V0SWQ6IG51bWJlciB8IG51bGw7XG5cbiAgLyoqIFByb3BlcnR5IHdhdGNoZWQgYnkgdGhlIGFuaW1hdGlvbiBmcmFtZXdvcmsgdG8gc2hvdyBvciBoaWRlIHRoZSB0b29sdGlwICovXG4gIF92aXNpYmlsaXR5OiBUb29sdGlwVmlzaWJpbGl0eSA9ICdpbml0aWFsJztcblxuICAvKiogV2hldGhlciBpbnRlcmFjdGlvbnMgb24gdGhlIHBhZ2Ugc2hvdWxkIGNsb3NlIHRoZSB0b29sdGlwICovXG4gIHByaXZhdGUgX2Nsb3NlT25JbnRlcmFjdGlvbjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8qKiBTdWJqZWN0IGZvciBub3RpZnlpbmcgdGhhdCB0aGUgdG9vbHRpcCBoYXMgYmVlbiBoaWRkZW4gZnJvbSB0aGUgdmlldyAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9vbkhpZGU6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZXRoZXIgdGhlIHVzZXIgaGFzIGEgaGFuZHNldC1zaXplZCBkaXNwbGF5LiAgKi9cbiAgX2lzSGFuZHNldDogT2JzZXJ2YWJsZTxCcmVha3BvaW50U3RhdGU+ID0gdGhpcy5fYnJlYWtwb2ludE9ic2VydmVyLm9ic2VydmUoQnJlYWtwb2ludHMuSGFuZHNldCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgX2JyZWFrcG9pbnRPYnNlcnZlcjogQnJlYWtwb2ludE9ic2VydmVyKSB7fVxuXG4gIC8qKlxuICAgKiBTaG93cyB0aGUgdG9vbHRpcCB3aXRoIGFuIGFuaW1hdGlvbiBvcmlnaW5hdGluZyBmcm9tIHRoZSBwcm92aWRlZCBvcmlnaW5cbiAgICogQHBhcmFtIGRlbGF5IEFtb3VudCBvZiBtaWxsaXNlY29uZHMgdG8gdGhlIGRlbGF5IHNob3dpbmcgdGhlIHRvb2x0aXAuXG4gICAqL1xuICBzaG93KGRlbGF5OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBDYW5jZWwgdGhlIGRlbGF5ZWQgaGlkZSBpZiBpdCBpcyBzY2hlZHVsZWRcbiAgICBpZiAodGhpcy5faGlkZVRpbWVvdXRJZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2hpZGVUaW1lb3V0SWQpO1xuICAgICAgdGhpcy5faGlkZVRpbWVvdXRJZCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gQm9keSBpbnRlcmFjdGlvbnMgc2hvdWxkIGNhbmNlbCB0aGUgdG9vbHRpcCBpZiB0aGVyZSBpcyBhIGRlbGF5IGluIHNob3dpbmcuXG4gICAgdGhpcy5fY2xvc2VPbkludGVyYWN0aW9uID0gdHJ1ZTtcbiAgICB0aGlzLl9zaG93VGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl92aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgdGhpcy5fc2hvd1RpbWVvdXRJZCA9IG51bGw7XG5cbiAgICAgIC8vIE1hcmsgZm9yIGNoZWNrIHNvIGlmIGFueSBwYXJlbnQgY29tcG9uZW50IGhhcyBzZXQgdGhlXG4gICAgICAvLyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSB0byBPblB1c2ggaXQgd2lsbCBiZSBjaGVja2VkIGFueXdheXNcbiAgICAgIHRoaXMuX21hcmtGb3JDaGVjaygpO1xuICAgIH0sIGRlbGF5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCZWdpbnMgdGhlIGFuaW1hdGlvbiB0byBoaWRlIHRoZSB0b29sdGlwIGFmdGVyIHRoZSBwcm92aWRlZCBkZWxheSBpbiBtcy5cbiAgICogQHBhcmFtIGRlbGF5IEFtb3VudCBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkgc2hvd2luZyB0aGUgdG9vbHRpcC5cbiAgICovXG4gIGhpZGUoZGVsYXk6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIENhbmNlbCB0aGUgZGVsYXllZCBzaG93IGlmIGl0IGlzIHNjaGVkdWxlZFxuICAgIGlmICh0aGlzLl9zaG93VGltZW91dElkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fc2hvd1RpbWVvdXRJZCk7XG4gICAgICB0aGlzLl9zaG93VGltZW91dElkID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9oaWRlVGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl92aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICB0aGlzLl9oaWRlVGltZW91dElkID0gbnVsbDtcblxuICAgICAgLy8gTWFyayBmb3IgY2hlY2sgc28gaWYgYW55IHBhcmVudCBjb21wb25lbnQgaGFzIHNldCB0aGVcbiAgICAgIC8vIENoYW5nZURldGVjdGlvblN0cmF0ZWd5IHRvIE9uUHVzaCBpdCB3aWxsIGJlIGNoZWNrZWQgYW55d2F5c1xuICAgICAgdGhpcy5fbWFya0ZvckNoZWNrKCk7XG4gICAgfSwgZGVsYXkpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYW4gb2JzZXJ2YWJsZSB0aGF0IG5vdGlmaWVzIHdoZW4gdGhlIHRvb2x0aXAgaGFzIGJlZW4gaGlkZGVuIGZyb20gdmlldy4gKi9cbiAgYWZ0ZXJIaWRkZW4oKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX29uSGlkZS5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB0b29sdGlwIGlzIGJlaW5nIGRpc3BsYXllZC4gKi9cbiAgaXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl92aXNpYmlsaXR5ID09PSAndmlzaWJsZSc7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLl9vbkhpZGUuY29tcGxldGUoKTtcbiAgfVxuXG4gIF9hbmltYXRpb25TdGFydCgpIHtcbiAgICB0aGlzLl9jbG9zZU9uSW50ZXJhY3Rpb24gPSBmYWxzZTtcbiAgfVxuXG4gIF9hbmltYXRpb25Eb25lKGV2ZW50OiBBbmltYXRpb25FdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IHRvU3RhdGUgPSBldmVudC50b1N0YXRlIGFzIFRvb2x0aXBWaXNpYmlsaXR5O1xuXG4gICAgaWYgKHRvU3RhdGUgPT09ICdoaWRkZW4nICYmICF0aGlzLmlzVmlzaWJsZSgpKSB7XG4gICAgICB0aGlzLl9vbkhpZGUubmV4dCgpO1xuICAgIH1cblxuICAgIGlmICh0b1N0YXRlID09PSAndmlzaWJsZScgfHwgdG9TdGF0ZSA9PT0gJ2hpZGRlbicpIHtcbiAgICAgIHRoaXMuX2Nsb3NlT25JbnRlcmFjdGlvbiA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEludGVyYWN0aW9ucyBvbiB0aGUgSFRNTCBib2R5IHNob3VsZCBjbG9zZSB0aGUgdG9vbHRpcCBpbW1lZGlhdGVseSBhcyBkZWZpbmVkIGluIHRoZVxuICAgKiBtYXRlcmlhbCBkZXNpZ24gc3BlYy5cbiAgICogaHR0cHM6Ly9tYXRlcmlhbC5pby9kZXNpZ24vY29tcG9uZW50cy90b29sdGlwcy5odG1sI2JlaGF2aW9yXG4gICAqL1xuICBfaGFuZGxlQm9keUludGVyYWN0aW9uKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9jbG9zZU9uSW50ZXJhY3Rpb24pIHtcbiAgICAgIHRoaXMuaGlkZSgwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgdGhhdCB0aGUgdG9vbHRpcCBuZWVkcyB0byBiZSBjaGVja2VkIGluIHRoZSBuZXh0IGNoYW5nZSBkZXRlY3Rpb24gcnVuLlxuICAgKiBNYWlubHkgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBpbml0aWFsIHRleHQgYmVmb3JlIHBvc2l0aW9uaW5nIGEgdG9vbHRpcCwgd2hpY2hcbiAgICogY2FuIGJlIHByb2JsZW1hdGljIGluIGNvbXBvbmVudHMgd2l0aCBPblB1c2ggY2hhbmdlIGRldGVjdGlvbi5cbiAgICovXG4gIF9tYXJrRm9yQ2hlY2soKTogdm9pZCB7XG4gICAgdGhpcy5fY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XG4gIH1cbn1cbiJdfQ==