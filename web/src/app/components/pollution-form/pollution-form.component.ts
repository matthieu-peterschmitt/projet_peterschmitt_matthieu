import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
  type OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import {
  type PollutionDeclaration,
  PollutionType,
} from '../../interfaces/pollution-declaration.interface';
import { PollutionService } from '../../services/pollution.service';

@Component({
  selector: 'app-pollution-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pollution-form.component.html',
  styleUrls: ['./pollution-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);

  // Input pour la pollution à éditer (optionnel)
  pollution = input<PollutionDeclaration | null>(null);

  @Output() declarationSubmitted = new EventEmitter<PollutionDeclaration>();

  pollutionForm: FormGroup;
  pollutionTypes = Object.values(PollutionType);
  protected readonly isFormSubmitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditMode = signal(false);

  constructor() {
    this.pollutionForm = this.formBuilder.group({
      titre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      dateObservation: ['', [Validators.required, this.dateValidator]],
      lieu: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      latitude: ['', [Validators.required, this.coordinateValidator('latitude')]],
      longitude: ['', [Validators.required, this.coordinateValidator('longitude')]],
      photoUrl: ['', [this.urlValidator]],
    });
  }

  ngOnInit(): void {
    const pollutionToEdit = this.pollution();
    if (pollutionToEdit) {
      this.isEditMode.set(true);
      this.populateForm(pollutionToEdit);
    }
  }

  private populateForm(pollution: PollutionDeclaration): void {
    // Convertir la date en format yyyy-MM-dd pour l'input date
    console.log('Full pollution object:', pollution);
    console.log('Type of pollution:', typeof pollution);
    console.log('date_observation value:', pollution.date_observation);
    console.log('date_observation type:', typeof pollution.date_observation);
    console.log('All keys:', Object.keys(pollution));

    let dateString = '';

    // Si pollution.date_observation n'existe pas directement, vérifier les autres propriétés
    const dateValue = pollution.date_observation || (pollution as any)['dateObservation'];

    if (dateValue) {
      try {
        dateString =
          dateValue instanceof Date
            ? dateValue.toISOString().split('T')[0]
            : new Date(dateValue).toISOString().split('T')[0];
      } catch (error) {
        console.error('Error parsing date:', error);
        dateString = '';
      }
    }

    this.pollutionForm.patchValue({
      titre: pollution.titre,
      type: pollution.type_pollution,
      description: pollution.description,
      dateObservation: dateString,
      lieu: pollution.lieu,
      latitude: pollution.latitude,
      longitude: pollution.longitude,
      photoUrl: pollution.photo_url || '',
    });
  }

  onSubmit(): void {
    if (this.pollutionForm.valid) {
      const formValue = this.pollutionForm.value;
      const declaration: PollutionDeclaration = {
        titre: formValue.titre.trim(),
        type_pollution: formValue.type as PollutionType,
        description: formValue.description.trim(),
        date_observation: new Date(formValue.dateObservation),
        lieu: formValue.lieu.trim(),
        latitude: parseFloat(formValue.latitude),
        longitude: parseFloat(formValue.longitude),
        photo_url: formValue.photoUrl ? formValue.photoUrl.trim() : undefined,
      };

      if (this.isEditMode()) {
        this.updatePollution(declaration);
      } else {
        this.createPollution(declaration);
      }
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private createPollution(declaration: PollutionDeclaration): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pollutionService
      .createPollution(declaration)
      .pipe(
        catchError((error) => {
          this.errorMessage.set('Erreur lors de la création: ' + error.message);
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((createdPollution) => {
        this.declarationSubmitted.emit(createdPollution);
        this.isFormSubmitted.set(true);
        this.isLoading.set(false);

        // Rediriger vers la liste ou les détails
        setTimeout(() => {
          this.router.navigate(['/pollutions']);
        }, 2000);
      });
  }

  private updatePollution(declaration: PollutionDeclaration): void {
    const pollutionToUpdate = this.pollution();
    if (!pollutionToUpdate?.id) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pollutionService
      .updatePollution(pollutionToUpdate.id, declaration)
      .pipe(
        catchError((error) => {
          this.errorMessage.set('Erreur lors de la mise à jour: ' + error.message);
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((updatedPollution) => {
        this.declarationSubmitted.emit(updatedPollution);
        this.isFormSubmitted.set(true);
        this.isLoading.set(false);

        // Rediriger vers les détails
        setTimeout(() => {
          this.router.navigate(['/pollution', updatedPollution.id]);
        }, 2000);
      });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.pollutionForm.controls).forEach((key) => {
      this.pollutionForm.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.isFormSubmitted.set(false);
    this.pollutionForm.reset();
  }

  dateValidator(control: { value: any }) {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    const minDate = new Date('1900-01-01');

    if (Number.isNaN(selectedDate.getTime())) {
      return { invalidDate: true };
    }

    if (selectedDate > today) {
      return { futureDate: true };
    }

    if (selectedDate < minDate) {
      return { tooOldDate: true };
    }

    return null;
  }

  coordinateValidator(type: 'latitude' | 'longitude') {
    return (control: { value: any }) => {
      if (!control.value) return null;

      const value = parseFloat(control.value);

      if (Number.isNaN(value)) {
        return { invalidNumber: true };
      }

      if (type === 'latitude') {
        if (value < -90 || value > 90) {
          return { latitudeOutOfRange: true };
        }
      } else if (type === 'longitude') {
        if (value < -180 || value > 180) {
          return { longitudeOutOfRange: true };
        }
      }

      return null;
    };
  }

  urlValidator(control: { value: any }) {
    if (!control.value || control.value.trim() === '') return null;

    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;

    if (!urlPattern.test(control.value.trim())) {
      return { invalidImageUrl: true };
    }

    return null;
  }

  getFieldError(fieldName: string): string {
    const field = this.pollutionForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return this.getRequiredErrorMessage(fieldName);
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} doit contenir au moins ${requiredLength} caractères.`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} ne peut pas dépasser ${maxLength} caractères.`;
      }

      if (field.errors['invalidNumber']) {
        return `${this.getFieldDisplayName(fieldName)} doit être un nombre valide.`;
      }
      if (field.errors['latitudeOutOfRange']) {
        return 'La latitude doit être comprise entre -90 et 90 degrés.';
      }
      if (field.errors['longitudeOutOfRange']) {
        return 'La longitude doit être comprise entre -180 et 180 degrés.';
      }

      if (field.errors['invalidDate']) {
        return "La date saisie n'est pas valide.";
      }
      if (field.errors['futureDate']) {
        return 'La date ne peut pas être dans le futur.';
      }
      if (field.errors['tooOldDate']) {
        return 'La date ne peut pas être antérieure à 1900.';
      }

      if (field.errors['invalidImageUrl']) {
        return "L'URL doit pointer vers une image valide (jpg, png, gif, etc.).";
      }
    }

    return '';
  }

  private getRequiredErrorMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      titre: 'Le titre de la pollution est requis.',
      type: 'Le type de pollution est requis.',
      description: 'La description de la pollution est requise.',
      dateObservation: "La date d'observation est requise.",
      lieu: 'Le lieu de la pollution est requis.',
      latitude: 'La latitude est requise.',
      longitude: 'La longitude est requise.',
    };
    return messages[fieldName] || `Le champ ${fieldName} est requis.`;
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: { [key: string]: string } = {
      titre: 'Le titre',
      type: 'Le type',
      description: 'La description',
      dateObservation: 'La date',
      lieu: 'Le lieu',
      latitude: 'La latitude',
      longitude: 'La longitude',
      photoUrl: "L'URL de la photo",
    };
    return names[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pollutionForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
