# Skill: scaffold-angular
## Angular Specialist — Feature Component Scaffold

**Invoked by:** scaffold-feature orchestrator (as a subagent)  
**Inputs:** ModuleName, FeatureName, moduleName (camelCase), featureName (camelCase)

---

## Instructions

You are the Angular specialist subagent. Generate two files following the exact patterns of this codebase.

---

### Codebase Patterns to Follow

- **Standalone components** — always `standalone: true`, import what you need explicitly
- **Inline templates** — template goes inside the component decorator, not a separate HTML file
- **ApiService** — use `ApiService` from `../../core/services/api.service` for HTTP calls, returns `Observable<T>`
- **CSS variables** — use `style="color: var(--lp-fg)"` etc. — never hardcode colors
- **Tailwind classes** — use utility classes for layout and spacing
- **No NgModules** — this project uses Angular standalone components only

---

### File 1: `Client.Angular/src/app/pages/{moduleName}/{featureName}/{featureName}.component.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-{featureName}',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1
          class="lp-serif font-semibold text-2xl"
          style="color: var(--lp-fg)"
        >
          {FeatureName}
        </h1>
      </div>

      @if (error) {
        <p class="text-sm" style="color: #dc2626">{{ error }}</p>
      }

      @if (loading) {
        <p class="text-sm" style="color: var(--lp-fg-dim)">Loading...</p>
      }

      <!-- TODO: add feature-specific UI here -->
    </div>
  `,
})
export class {FeatureName}Component {
  loading = false;
  error = '';

  constructor(private readonly api: ApiService) {}

  // TODO: implement component logic
}
```

---

### File 2: `Client.Angular/src/app/pages/{moduleName}/{featureName}/{featureName}.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { {FeatureName}Component } from './{featureName}.component';
import { ApiService } from '../../../core/services/api.service';

describe('{FeatureName}Component', () => {
  let component: {FeatureName}Component;
  let fixture: ComponentFixture<{FeatureName}Component>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      // TODO: add methods this component calls
    ]);

    await TestBed.configureTestingModule({
      imports: [{FeatureName}Component],
      providers: [{ provide: ApiService, useValue: apiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent({FeatureName}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO: add feature-specific tests
});
```

---

### After generating files, report to orchestrator

Return:
- Full paths of both files created
- Note any ApiService methods that need to be added for this feature
- Note the route to register in `Client.Angular/src/app/app.routes.ts`
