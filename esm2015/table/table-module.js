/**
 * @fileoverview added by tsickle
 * Generated from: src/material/table/table-module.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatTable } from './table';
import { CdkTableModule } from '@angular/cdk/table';
import { MatCell, MatCellDef, MatColumnDef, MatFooterCell, MatFooterCellDef, MatHeaderCell, MatHeaderCellDef } from './cell';
import { MatFooterRow, MatFooterRowDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatNoDataRow } from './row';
import { MatTextColumn } from './text-column';
import { MatCommonModule } from '@angular/material/core';
/** @type {?} */
const EXPORTED_DECLARATIONS = [
    // Table
    MatTable,
    // Template defs
    MatHeaderCellDef,
    MatHeaderRowDef,
    MatColumnDef,
    MatCellDef,
    MatRowDef,
    MatFooterCellDef,
    MatFooterRowDef,
    // Cell directives
    MatHeaderCell,
    MatCell,
    MatFooterCell,
    // Row directives
    MatHeaderRow,
    MatRow,
    MatFooterRow,
    MatNoDataRow,
    MatTextColumn,
];
export class MatTableModule {
}
MatTableModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CdkTableModule,
                    MatCommonModule,
                ],
                exports: [MatCommonModule, EXPORTED_DECLARATIONS],
                declarations: EXPORTED_DECLARATIONS,
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYmxlL3RhYmxlLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFDakMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ2xELE9BQU8sRUFDTCxPQUFPLEVBQ1AsVUFBVSxFQUNWLFlBQVksRUFDWixhQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLGFBQWEsRUFDYixnQkFBZ0IsRUFDakIsTUFBTSxRQUFRLENBQUM7QUFDaEIsT0FBTyxFQUNMLFlBQVksRUFDWixlQUFlLEVBQ2YsWUFBWSxFQUNaLGVBQWUsRUFDZixNQUFNLEVBQ04sU0FBUyxFQUNULFlBQVksRUFDYixNQUFNLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDOztNQUVqRCxxQkFBcUIsR0FBRztJQUM1QixRQUFRO0lBQ1IsUUFBUTtJQUVSLGdCQUFnQjtJQUNoQixnQkFBZ0I7SUFDaEIsZUFBZTtJQUNmLFlBQVk7SUFDWixVQUFVO0lBQ1YsU0FBUztJQUNULGdCQUFnQjtJQUNoQixlQUFlO0lBRWYsa0JBQWtCO0lBQ2xCLGFBQWE7SUFDYixPQUFPO0lBQ1AsYUFBYTtJQUViLGlCQUFpQjtJQUNqQixZQUFZO0lBQ1osTUFBTTtJQUNOLFlBQVk7SUFDWixZQUFZO0lBRVosYUFBYTtDQUNkO0FBVUQsTUFBTSxPQUFPLGNBQWM7OztZQVIxQixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLGNBQWM7b0JBQ2QsZUFBZTtpQkFDaEI7Z0JBQ0QsT0FBTyxFQUFFLENBQUMsZUFBZSxFQUFFLHFCQUFxQixDQUFDO2dCQUNqRCxZQUFZLEVBQUUscUJBQXFCO2FBQ3BDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRUYWJsZX0gZnJvbSAnLi90YWJsZSc7XG5pbXBvcnQge0Nka1RhYmxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHtcbiAgTWF0Q2VsbCxcbiAgTWF0Q2VsbERlZixcbiAgTWF0Q29sdW1uRGVmLFxuICBNYXRGb290ZXJDZWxsLFxuICBNYXRGb290ZXJDZWxsRGVmLFxuICBNYXRIZWFkZXJDZWxsLFxuICBNYXRIZWFkZXJDZWxsRGVmXG59IGZyb20gJy4vY2VsbCc7XG5pbXBvcnQge1xuICBNYXRGb290ZXJSb3csXG4gIE1hdEZvb3RlclJvd0RlZixcbiAgTWF0SGVhZGVyUm93LFxuICBNYXRIZWFkZXJSb3dEZWYsXG4gIE1hdFJvdyxcbiAgTWF0Um93RGVmLFxuICBNYXROb0RhdGFSb3dcbn0gZnJvbSAnLi9yb3cnO1xuaW1wb3J0IHtNYXRUZXh0Q29sdW1ufSBmcm9tICcuL3RleHQtY29sdW1uJztcbmltcG9ydCB7TWF0Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcblxuY29uc3QgRVhQT1JURURfREVDTEFSQVRJT05TID0gW1xuICAvLyBUYWJsZVxuICBNYXRUYWJsZSxcblxuICAvLyBUZW1wbGF0ZSBkZWZzXG4gIE1hdEhlYWRlckNlbGxEZWYsXG4gIE1hdEhlYWRlclJvd0RlZixcbiAgTWF0Q29sdW1uRGVmLFxuICBNYXRDZWxsRGVmLFxuICBNYXRSb3dEZWYsXG4gIE1hdEZvb3RlckNlbGxEZWYsXG4gIE1hdEZvb3RlclJvd0RlZixcblxuICAvLyBDZWxsIGRpcmVjdGl2ZXNcbiAgTWF0SGVhZGVyQ2VsbCxcbiAgTWF0Q2VsbCxcbiAgTWF0Rm9vdGVyQ2VsbCxcblxuICAvLyBSb3cgZGlyZWN0aXZlc1xuICBNYXRIZWFkZXJSb3csXG4gIE1hdFJvdyxcbiAgTWF0Rm9vdGVyUm93LFxuICBNYXROb0RhdGFSb3csXG5cbiAgTWF0VGV4dENvbHVtbixcbl07XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBDZGtUYWJsZU1vZHVsZSxcbiAgICBNYXRDb21tb25Nb2R1bGUsXG4gIF0sXG4gIGV4cG9ydHM6IFtNYXRDb21tb25Nb2R1bGUsIEVYUE9SVEVEX0RFQ0xBUkFUSU9OU10sXG4gIGRlY2xhcmF0aW9uczogRVhQT1JURURfREVDTEFSQVRJT05TLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRUYWJsZU1vZHVsZSB7fVxuIl19