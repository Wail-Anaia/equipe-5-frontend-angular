import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateUserComponent } from './create-user';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user-service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('CreateUserComponent', () => {

  let component: CreateUserComponent;
  let fixture: ComponentFixture<CreateUserComponent>;
  let userServiceSpy: any;

  beforeEach(async () => {

    userServiceSpy = {
      create: vi.fn()
    };

  await TestBed.configureTestingModule({
  imports: [
    ReactiveFormsModule,
    CreateUserComponent
  ],
  providers: [
    { provide: UserService, useValue: userServiceSpy }
  ]
  }).compileComponents();

    fixture = TestBed.createComponent(CreateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── T-F01 : Succès création ─────────────────────────────────────────
  it('T-F01: devrait afficher successMsg après création', () => {

    userServiceSpy.create.mockReturnValue(of({
      id: 1,
      nom: 'Ali',
      email: 'ali@test.com',
      role: 'ETUDIANT',
      actif: true
    } as any));

    component.form.setValue({
      nom: 'Ali',
      email: 'ali@test.com',
      password: '123456',
      role: 'ETUDIANT'
    });

    component.submit();

    expect(component.successMsg).toBe('Utilisateur créé avec succès');
    expect(component.form.get('nom')?.value).toBe('');
  });

  // ── T-F04 : Email invalide ──────────────────────────────────────────
  it('T-F04: devrait invalider un email mal formé', () => {

    component.form.get('email')?.setValue('notanemail');
    component.form.get('email')?.markAsTouched();

    expect(component.isInvalid('email')).toBe(true);
  });

  // ── T-F06 : Erreur métier backend ───────────────────────────────────
  it('T-F06: devrait afficher le message d\'erreur du backend', () => {

    const errResp = new HttpErrorResponse({
      error: { error: 'Email déjà utilisé' },
      status: 400
    });

    userServiceSpy.create.mockReturnValue(
      throwError(() => errResp)
    );

    component.form.setValue({
      nom: 'Ali',
      email: 'existing@test.com',
      password: '123456',
      role: 'ETUDIANT'
    });

    component.submit();

    expect(component.errorMsg).toBe('Email déjà utilisé');
    expect(component.loading).toBe(false);
  });

});
