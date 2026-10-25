package com.odam.service;

import com.odam.entity.HistoriaClinica;
import com.odam.entity.Paciente;
import com.odam.entity.UrgenciaDental;
import com.odam.repository.UrgenciaDentalRepository;

import java.lang.reflect.Field;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UrgenciaDentalServiceTest {

    @Mock
    private UrgenciaDentalRepository urgenciaRepository;

    @InjectMocks
    private UrgenciaDentalService urgenciaDentalService;

    @Test
    void crearUrgenciaValidaSinEstadoDebeAsignarActiva() {
        Paciente paciente = new Paciente();
        asignarIdPaciente(paciente, 1);

        HistoriaClinica historia = new HistoriaClinica();
        historia.setIdHistoria(1);

        UrgenciaDental urgencia = new UrgenciaDental();
        urgencia.setPaciente(paciente);
        urgencia.setHistoriaClinica(historia);
        urgencia.setTipoUrgencia("DOLOR DENTAL");
        urgencia.setDescripcion("Dolor dental intenso");
        urgencia.setEstado(" ");

        when(urgenciaRepository.save(any(UrgenciaDental.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));

        UrgenciaDental resultado = urgenciaDentalService.crear(urgencia);

        assertNotNull(resultado);
        assertEquals("ACTIVA", resultado.getEstado());
        verify(urgenciaRepository).save(urgencia);
    }

    @Test
    void buscarPorIdInvalidoDebeLanzarBadRequest() {
        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> urgenciaDentalService.buscarPorId(0)
        );

        assertEquals(HttpStatus.BAD_REQUEST, excepcion.getStatusCode());
        verifyNoInteractions(urgenciaRepository);
    }

    @Test
    void buscarPorIdInexistenteDebeLanzarNotFound() {
        when(urgenciaRepository.findById(99))
                .thenReturn(Optional.empty());

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> urgenciaDentalService.buscarPorId(99)
        );

        assertEquals(HttpStatus.NOT_FOUND, excepcion.getStatusCode());
        verify(urgenciaRepository).findById(99);
    }

    @Test
    void crearSinPacienteDebeLanzarBadRequest() {
        HistoriaClinica historia = new HistoriaClinica();
        historia.setIdHistoria(1);

        UrgenciaDental urgencia = new UrgenciaDental();
        urgencia.setHistoriaClinica(historia);
        urgencia.setTipoUrgencia("DOLOR DENTAL");
        urgencia.setDescripcion("Dolor dental intenso");

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> urgenciaDentalService.crear(urgencia)
        );

        assertEquals(HttpStatus.BAD_REQUEST, excepcion.getStatusCode());
        verifyNoInteractions(urgenciaRepository);
    }

    @Test
    void crearConEstadoInvalidoDebeLanzarBadRequest() {
        Paciente paciente = new Paciente();
        asignarIdPaciente(paciente, 1);

        HistoriaClinica historia = new HistoriaClinica();
        historia.setIdHistoria(1);

        UrgenciaDental urgencia = new UrgenciaDental();
        urgencia.setPaciente(paciente);
        urgencia.setHistoriaClinica(historia);
        urgencia.setTipoUrgencia("DOLOR DENTAL");
        urgencia.setDescripcion("Dolor dental intenso");
        urgencia.setEstado("PENDIENTE");

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> urgenciaDentalService.crear(urgencia)
        );

        assertEquals(HttpStatus.BAD_REQUEST, excepcion.getStatusCode());
        verifyNoInteractions(urgenciaRepository);
    }

    private void asignarIdPaciente(Paciente paciente, Integer id) {
        try {
            Field campo = Paciente.class.getDeclaredField("idPaciente");
            campo.setAccessible(true);
            campo.set(paciente, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(
                    "No se pudo asignar el ID del paciente para la prueba", e
            );
        }
    }
}