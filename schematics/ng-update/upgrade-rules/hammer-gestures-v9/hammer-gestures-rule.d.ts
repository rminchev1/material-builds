/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/material/schematics/ng-update/upgrade-rules/hammer-gestures-v9/hammer-gestures-rule" />
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { MigrationRule, ResolvedResource } from '@angular/cdk/schematics';
import * as ts from 'typescript';
export declare class HammerGesturesRule extends MigrationRule<null> {
    ruleEnabled: boolean;
    private _printer;
    private _importManager;
    private _nodeFailures;
    /** Whether HammerJS is explicitly used in any component template. */
    private _usedInTemplate;
    /** Whether HammerJS is accessed at runtime. */
    private _usedInRuntime;
    /**
     * List of imports that make "hammerjs" available globally. We keep track of these
     * since we might need to remove them if Hammer is not used.
     */
    private _installImports;
    /**
     * List of identifiers which resolve to the gesture config from Angular Material.
     */
    private _gestureConfigReferences;
    /**
     * List of identifiers which resolve to "HAMMER_GESTURE_CONFIG" token from
     * "@angular/platform-browser".
     */
    private _hammerConfigTokenReferences;
    /**
     * List of identifiers that have been deleted from source files. This can be
     * used to determine if certain imports are still used or not.
     */
    private _deletedIdentifiers;
    visitTemplate(template: ResolvedResource): void;
    visitNode(node: ts.Node): void;
    postAnalysis(): void;
    /**
     * Sets up the hammer gesture config in the current project. To achieve this, the
     * following steps are performed:
     *   1) Create copy of Angular Material gesture config.
     *   2) Rewrite all references to the Angular Material gesture config to the
     *      newly copied gesture config.
     *   3) Setup the HAMMER_GESTURE_CONFIG provider in the root app module
     *      (if not done already).
     */
    private _setupHammerGestureConfig;
    /**
     * Removes Hammer from the current project. The following steps are performed:
     *   1) Delete all TypeScript imports to "hammerjs".
     *   2) Remove references to the Angular Material gesture config.
     *   3) Remove "hammerjs" from all index HTML files of the current project.
     */
    private _removeHammerSetup;
    /**
     * Removes the gesture config setup by deleting all found references
     * to a gesture config. Additionally, unused imports to the hammer gesture
     * config token from platform-browser are removed as well.
     */
    private _removeGestureConfigSetup;
    /**
     * Checks if the given node is a reference to the hammer gesture config
     * token from platform-browser. If so, keeps track of the reference.
     */
    private _checkForHammerGestureConfigToken;
    /**
     * Checks if the given node is an import to the HammerJS package. Imports to
     * HammerJS which load specific symbols from the package are considered as
     * runtime usage of Hammer. e.g. `import {Symbol} from "hammerjs";`.
     */
    private _checkHammerImports;
    /**
     * Checks if the given node accesses the global "Hammer" symbol at runtime. If so,
     * the migration rule state will be updated to reflect that Hammer is used at runtime.
     */
    private _checkForRuntimeHammerUsage;
    /**
     * Checks if the given node references the gesture config from Angular Material.
     * If so, we keep track of the found symbol reference.
     */
    private _checkForMaterialGestureConfig;
    /**
     * Checks if the given Hammer gesture config token reference is part of an
     * Angular provider definition that sets up a custom gesture config.
     */
    private _checkForCustomGestureConfigSetup;
    /**
     * Determines an available file name for the gesture config which should
     * be stored in the specified file path.
     */
    private _getAvailableGestureConfigFileName;
    /**
     * Replaces a given gesture config reference by ensuring that it is imported
     * from the new specified path.
     */
    private _replaceGestureConfigReference;
    /**
     * Removes a given gesture config reference and its corresponding import from
     * its containing source file. Imports will be always removed, but in some cases,
     * where it's not guaranteed that a removal can be performed safely, we just
     * create a migration failure (and add a TODO if possible).
     */
    private _removeGestureConfigReference;
    /** Removes the given hammer config token import if it is not used. */
    private _removeHammerConfigTokenImportIfUnused;
    /** Removes Hammer from all index HTML files of the given project. */
    private _removeHammerFromIndexFile;
    /** Sets up the Hammer gesture config provider in the app module if needed. */
    private _setupGestureConfigInAppModule;
    /** Prints a given node within the specified source file. */
    private _printNode;
    /** Gets the symbol that contains the value declaration of the specified node. */
    private _getDeclarationSymbolOfNode;
    /**
     * Checks whether the given expression resolves to a hammer gesture config
     * token reference from "@angular/platform-browser".
     */
    private _isReferenceToHammerConfigToken;
    /**
     * Creates migration failures of the collected node failures. The returned migration
     * failures are updated to reflect the post-migration state of source files. Meaning
     * that failure positions are corrected if source file modifications shifted lines.
     */
    private _createMigrationFailures;
    /**
     * Gets the project from the current program or throws if no project
     * could be found.
     */
    private _getProjectOrThrow;
    /** Global state of whether Hammer is used in any analyzed project target. */
    static globalUsesHammer: boolean;
    /**
     * Static migration rule method that will be called once all project targets
     * have been migrated individually. This method can be used to make changes based
     * on the analysis of the individual targets. For example: we only remove Hammer
     * from the "package.json" if it is not used in *any* project target.
     */
    static globalPostMigration(tree: Tree, context: SchematicContext): void;
    /**
     * Removes the hammer package from the workspace "package.json".
     * @returns Whether Hammer was set up and has been removed from the "package.json"
     */
    private static _removeHammerFromPackageJson;
}
